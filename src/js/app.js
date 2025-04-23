var phaseEnum; // for changing phases of voting
App = {
  web3Provider: null,
  contracts: {},
  account: "0x0", // Đảm bảo khởi tạo tài khoản

  init: async function () {
    // Load pets.
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        App.account = accounts[0]; // Lấy tài khoản từ MetaMask
        console.log("Connected account: ", App.account);
      } catch (error) {
        if (error.code === 4001) {
          // User rejected the connection request
          console.log("User rejected the request");
        }
      }
    } else {
      console.log("MetaMask is not installed");
    }

    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Contest.json", function (contest) {
      App.contracts.Contest = TruffleContract(contest);
      App.contracts.Contest.setProvider(window.ethereum); // Thiết lập provider từ MetaMask
      return App.render();
    });
  },

  render: function () {
    var contestInstance;
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();
    $("#after").hide();

    // Lấy tài khoản người dùng từ MetaMask
    if (typeof window.ethereum !== "undefined") {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          App.account = accounts[0];
          $("#accountAddress").html("Your account: " + App.account);
        })
        .catch((error) => {
          console.error("Error fetching accounts: ", error);
        });
    }

    // Fetching candidates to front end from blockchain
    App.contracts.Contest.deployed().then(function (instance) {
      contestInstance = instance;
      return contestInstance.contestantsCount();
    });
    App.contracts.Contest.deployed()
      .then(function (instance) {
        contestInstance = instance;
        // Fetch the number of contestants
        return contestInstance.contestantsCount();
      })
      .then(function (contestantsCount) {
        // Fetch admin address after fetching contestants count
        return App.contracts.Contest.deployed(); // Re-fetch contract instance to get admin address
      })
      .then(function (instance) {
        return instance.getAdmin(); // Get the admin address from the contract
      })
      .then(function (adminAddress) {
        console.log("Admin address: " + adminAddress); // Display admin address in the console

        // Display the admin's address in the UI
        $("#adminAddress").html("Admin address: " + adminAddress);

        // Fetch contestants data and display them
        App.contracts.Contest.deployed()
          .then(function (instance) {
            contestInstance = instance;
            return contestInstance.contestantsCount(); // Fetch contestants count again
          })
          .then(function (contestantsCount) {
            var contestantsResults = $("#test");
            contestantsResults.empty();
            var contestantsResultsAdmin = $("#contestantsResultsAdmin");
            contestantsResultsAdmin.empty();
            var contestantSelect = $("#contestantSelect");
            contestantSelect.empty();

            // Loop through all contestants and display them
            for (var i = 1; i <= contestantsCount; i++) {
              contestInstance.contestants(i).then(function (contestant) {
                var id = contestant[0];
                var name = contestant[1];
                var voteCount = contestant[2];
                var fetchedParty = contestant[3];
                var fetchedAge = contestant[4];
                var fetchedQualification = contestant[5];

                var contestantTemplate =
                  "<div class='card' style='width: 15rem; margin: 1rem;'><img class='card-img-top' src='../img/Sample_User_Icon.png' alt=''><div class='card-body text-center'><h4 class='card-title'>" +
                  name +
                  "</h4>" +
                  "<button type='button' class='btn btn-info' data-toggle='modal' data-target='#modal" +
                  id +
                  "'>Nhấn để VOTE</button>" +
                  "<div class='modal fade' id='modal" +
                  id +
                  "' tabindex='-1' role='dialog' aria-labelledby='exampleModalCenterTitle' aria-hidden='true'>" +
                  "<div class='modal-dialog modal-dialog-centered' role='document'>" +
                  "<div class='modal-content'>" +
                  "<div class='modal-header'>" +
                  "<h5 class='modal-title' id='exampleModalLongTitle'> <b>" +
                  name +
                  "</b></h5>" +
                  "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
                  "</div>" +
                  "<div class='modal-body'> <b> Đảng: " +
                  fetchedParty +
                  "<br>Tuổi: " +
                  fetchedAge +
                  "<br>Trình độ học vấn: " +
                  fetchedQualification +
                  "<br></b></div>" +
                  "<div class='modal-footer'>" +
                  "<button class='btn btn-info' onClick='App.castVote(" +
                  id.toString() +
                  ")'>VOTE</button>" +
                  "<button type='button' class='btn btn-info' data-dismiss='modal'>Đóng</button></div>" +
                  "</div></div></div>" +
                  "</div></div>";

                contestantsResults.append(contestantTemplate);

                var contestantOption =
                  "<option style='padding: auto;' value='" +
                  id +
                  "'>" +
                  name +
                  "</option>";
                contestantSelect.append(contestantOption);

                var contestantTemplateAdmin =
                  "<tr><th>" +
                  id +
                  "</th><td>" +
                  name +
                  "</td><td>" +
                  fetchedAge +
                  "</td><td>" +
                  fetchedParty +
                  "</td><td>" +
                  fetchedQualification +
                  "</td><td>" +
                  voteCount +
                  "</td></tr>";
                contestantsResultsAdmin.append(contestantTemplateAdmin);
              });
            }

            loader.hide();
            content.show();
          })
          .catch(function (error) {
            console.warn(error);
          });
      })
      .catch(function (error) {
        console.warn(error);
      });

    // Fetching current phase code
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.state();
      })
      .then(function (state) {
        var fetchedState;
        var fetchedStateAdmin;
        phaseEnum = state.toString(); // Cập nhật giai đoạn mới từ hợp đồng
        if (state == 0) {
          fetchedState =
            "Giai đoạn đăng ký đang mở, hãy đăng ký để tham gia bỏ phiếu!";
          fetchedStateAdmin = "Đăng ký";
          $("#changePhaseButton").text("Bắt đầu bỏ phiếu"); // Thay đổi văn bản nút khi ở giai đoạn đăng ký
        } else if (state == 1) {
          fetchedState = "Bỏ phiếu đang mở!";
          fetchedStateAdmin = "Bỏ phiếu";
          $("#changePhaseButton").text("Kết thúc bỏ phiếu"); // Thay đổi văn bản nút khi ở giai đoạn bỏ phiếu
        } else {
          fetchedState = "Bỏ phiếu đã kết thúc!";
          fetchedStateAdmin = "Cuộc bầu cử kết thúc";
          $("#changePhaseButton").text("Cuộc bầu cử đã kết thúc"); // Khi bỏ phiếu đã kết thúc
        }

        // Cập nhật giao diện người dùng với trạng thái mới
        var currentPhase = $("#currentPhase"); // Để hiển thị cho người dùng
        currentPhase.empty();
        var currentPhaseAdmin = $("#currentPhaseAdmin"); // Để hiển thị cho admin
        currentPhaseAdmin.empty();

        // Hiển thị thông tin trạng thái cho người dùng và admin
        var phaseTemplate = "<h1>" + fetchedState + "</h1>";
        var phaseTemplateAdmin =
          "<h3> Giai đoạn hiện tại: " + fetchedStateAdmin + "</h3>";

        // Cập nhật giao diện với trạng thái mới
        currentPhase.append(phaseTemplate);
        currentPhaseAdmin.append(phaseTemplateAdmin);
      })
      .catch(function (err) {
        console.error("Lỗi khi lấy trạng thái:", err);
      });

    // Showing result
    App.contracts.Contest.deployed()
      .then(function (instance) {
        return instance.state();
      })
      .then(function (state) {
        var result = $("#Results");
        if (state == 2) {
          $("#not").hide();
          contestInstance.contestantsCount().then(function (contestantsCount) {
            for (var i = 1; i <= contestantsCount; i++) {
              contestInstance.contestants(i).then(function (contestant) {
                var id = contestant[0];
                var name = contestant[1];
                var voteCount = contestant[2];
                var fetchedParty = contestant[3];
                var fetchedAge = contestant[4];
                var fetchedQualification = contestant[5];

                var resultTemplate =
                  "<tr><th>" +
                  id +
                  "</th><td>" +
                  name +
                  "</td><td>" +
                  fetchedAge +
                  "</td><td>" +
                  fetchedParty +
                  "</td><td>" +
                  fetchedQualification +
                  "</td><td>" +
                  voteCount +
                  "</td></tr>";
                result.append(resultTemplate);
              });
            }
          });
        } else {
          $("#renderTable").hide();
        }
      })
      .catch(function (err) {
        console.error(err);
      });
  },

  // Voting code
  // castVote: function (id) {
  //   var contestantId = id;
  //   App.contracts.Contest.deployed()
  //     .then(function (instance) {
  //       return instance.vote(contestantId, { from: App.account });
  //     })
  //     .then(function (result) {
  //       // Voting success
  //     })
  //     .catch(function (err) {
  //       console.error(err);
  //     });
  // },

  castVote: function (id) {
    var contestantId = id;

    // Gọi hợp đồng để bỏ phiếu
    App.contracts.Contest.deployed()
      .then(function (instance) {
        // Gửi giao dịch bỏ phiếu tới hợp đồng
        return instance.vote(contestantId, { from: App.account });
      })
      .then(function (result) {
        // Bỏ phiếu thành công, hiển thị thông báo thành công với SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Bạn đã bỏ phiếu thành công cho ứng viên ID: " + contestantId,
        });
        console.log("Voting result:", result); // Log kết quả giao dịch nếu cần
      })
      .catch(function (err) {
        // Nếu có lỗi, hiển thị thông báo lỗi chi tiết với SweetAlert2
        console.error("Lỗi khi bỏ phiếu:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi bỏ phiếu. Vui lòng kiểm tra console để biết chi tiết.",
        });
      });
  },

  // Adding candidate code
  addCandidate: function () {
    $("#loader").hide();

    // Lấy giá trị từ form
    var name = $("#name").val();
    var age = $("#age").val();
    var party = $("#party").val();
    var qualification = $("#qualification").val();

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!name || !party || !qualification || !age) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Vui lòng điền đầy đủ các trường thông tin.",
      });
      return;
    }

    if (isNaN(age) || age <= 0) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Vui lòng nhập tuổi hợp lệ.",
      });
      return;
    }

    // Chuyển đổi age sang kiểu int (số nguyên)
    age = parseInt(age);

    // Đảm bảo rằng hợp đồng đã được triển khai
    App.contracts.Contest.deployed()
      .then(function (instance) {
        // Gọi hàm addContestant từ hợp đồng
        return instance.addContestant(name, party, age, qualification, {
          from: App.account,
        });
      })
      .then(function (result) {
        // Sau khi thêm ứng viên vào hợp đồng, gửi dữ liệu tới backend để lưu vào cơ sở dữ liệu
        $.ajax({
          url: "/addCandidate", // Đường dẫn tới API trên backend
          type: "POST", // Sử dụng POST thay vì GET
          data: {
            name: name,
            party: party,
            age: age,
            qualification: qualification,
          },
          success: function (response) {
            // Hiển thị thông báo thành công và reset form
            $("#loader").show();
            $("#name").val("");
            $("#age").val("");
            $("#party").val("");
            $("#qualification").val("");

            Swal.fire({
              icon: "success",
              title: "Thành Công!",
              text: "Ứng viên đã được thêm thành công!",
            });
          },
          error: function (err) {
            console.error("Error adding candidate to database: ", err);
            Swal.fire({
              icon: "error",
              title: "Lỗi!",
              text: "Đã xảy ra lỗi khi thêm ứng viên vào cơ sở dữ liệu. Vui lòng thử lại.",
            });
          },
        });
      })
      .catch(function (err) {
        // Lỗi: Hiển thị lỗi ra console
        console.error("Error adding candidate: ", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi thêm ứng viên. Vui lòng thử lại.",
        });
      });
  },

  changeState: function () {
    console.log("Trạng thái hiện tại:", phaseEnum); // Log trạng thái hiện tại trước khi thay đổi
    phaseEnum++; // Tăng giai đoạn (state)

    App.contracts.Contest.deployed() // Đảm bảo hợp đồng đã được triển khai
      .then(function (instance) {
        console.log("Đối tượng hợp đồng:", instance);
        // Gọi hàm để thay đổi trạng thái
        return instance.changeState(phaseEnum, { from: App.account }); // Đảm bảo trường 'from' đã được thiết lập đúng
      })
      .then(function (result) {
        // Ẩn nội dung hiện tại và hiển thị loader
        $("#content").hide();
        $("#loader").show();

        // Lấy trạng thái mới từ hợp đồng
        return App.contracts.Contest.deployed();
      })
      .then(function (instance) {
        return instance.state(); // Lấy trạng thái hiện tại của hợp đồng
      })
      .then(function (state) {
        var fetchedState;
        var fetchedStateAdmin;
        phaseEnum = state.toString(); // Cập nhật giai đoạn

        // Xử lý trạng thái giai đoạn
        if (state == 0) {
          fetchedState =
            "Giai đoạn đăng ký đang mở, hãy đăng ký để tham gia bỏ phiếu!";
          fetchedStateAdmin = "Đăng ký";
          $("#changePhaseButton").text("Bắt đầu bỏ phiếu"); // Nếu đang ở giai đoạn đăng ký
        } else if (state == 1) {
          fetchedState = "Bỏ phiếu đang mở!";
          fetchedStateAdmin = "Bỏ phiếu";
          $("#changePhaseButton").text("Kết thúc bỏ phiếu"); // Nếu đang ở giai đoạn bỏ phiếu
        } else {
          fetchedState = "Bỏ phiếu đã kết thúc!";
          fetchedStateAdmin = "Cuộc bầu cử kết thúc";
          $("#changePhaseButton").text("Cuộc bầu cử đã kết thúc"); // Khi kết thúc
        }

        // Cập nhật trạng thái trên giao diện
        var currentPhase = $("#currentPhase"); // For user
        currentPhase.empty();
        var currentPhaseAdmin = $("#currentPhaseAdmin"); // For admin
        currentPhaseAdmin.empty();

        var phaseTemplate = "<h1>" + fetchedState + "</h1>";
        var phaseTemplateAdmin =
          "<h3> Giai đoạn hiện tại: " + fetchedStateAdmin + "</h3>";

        currentPhase.append(phaseTemplate);
        currentPhaseAdmin.append(phaseTemplateAdmin);

        // Hiển thị thông báo thành công với SweetAlert2
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Trạng thái đã được thay đổi thành công!",
        });
      })
      .catch(function (err) {
        console.error("Lỗi khi thay đổi trạng thái:", err);
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: "Đã xảy ra lỗi khi thay đổi trạng thái. Vui lòng kiểm tra console để biết chi tiết.",
        });
      });
  },

  // Registering voter code
  registerVoter: function () {
    var add = $("#accadd").val();

    // Kiểm tra địa chỉ Ethereum hợp lệ
    if (!add || !/^0x[a-fA-F0-9]{40}$/.test(add)) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Địa chỉ Ethereum không hợp lệ.",
      });
      return; // Dừng nếu địa chỉ không hợp lệ
    }

    // Yêu cầu MetaMask kết nối tài khoản
    if (typeof window.ethereum !== "undefined") {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((accounts) => {
          const account = accounts[0]; // Lấy tài khoản từ MetaMask

          // Tiến hành đăng ký cử tri nếu ví MetaMask đã kết nối
          App.contracts.Contest.deployed()
            .then(function (instance) {
              return instance.voterRegisteration(add, { from: account }); // Đảm bảo admin là người gọi
            })
            .then(function (result) {
              // Sau khi đăng ký cử tri thành công, gửi yêu cầu tới API backend để cập nhật cơ sở dữ liệu
              $.ajax({
                url: "/updateVoterStatus", // Đường dẫn tới API backend
                type: "POST", // Sử dụng phương thức POST
                data: {
                  accountAddress: add, // Địa chỉ Ethereum của cử tri
                },
                success: function (response) {
                  // Hiển thị thông báo thành công và reset form
                  $("#loader").show();
                  $("#accadd").val(""); // Xóa thông tin nhập vào trong form

                  Swal.fire({
                    icon: "success",
                    title: "Thành công!",
                    text: "Cử tri đã được đăng ký thành công và cơ sở dữ liệu đã được cập nhật!",
                  });
                },
                error: function (err) {
                  console.error(
                    "Error updating voter status in database:",
                    err
                  );
                  Swal.fire({
                    icon: "error",
                    title: "Lỗi!",
                    text: "Đã xảy ra lỗi khi cập nhật trạng thái cử tri trong cơ sở dữ liệu. Vui lòng thử lại.",
                  });
                },
              });
            })
            .catch(function (err) {
              console.error("Error registering voter:", err); // Log chi tiết lỗi
              Swal.fire({
                icon: "error",
                title: "Lỗi!",
                text: "Đã xảy ra lỗi khi đăng ký cử tri. Vui lòng kiểm tra console.",
              });
            });
        })
        .catch((err) => {
          console.error("MetaMask connection error:", err);
          Swal.fire({
            icon: "warning",
            title: "Cảnh Báo!",
            text: "Vui lòng kết nối MetaMask.",
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Cảnh Báo!",
        text: "Vui lòng cài đặt MetaMask để sử dụng ứng dụng này!",
      });
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
