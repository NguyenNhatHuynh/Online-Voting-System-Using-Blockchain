module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Đảm bảo bạn sử dụng port Ganache đúng
      network_id: "*", // Chấp nhận bất kỳ network id nào
    },
  },
  compilers: {
    solc: {
      version: "0.5.16",  // Sử dụng phiên bản Solidity 0.5.16 cho các hợp đồng yêu cầu phiên bản này
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
