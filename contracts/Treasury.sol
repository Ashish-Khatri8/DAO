// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract Treasury is Ownable {
    receive() external payable {}

    function sendEther(address payable _to, uint256 _weiAmount) external onlyOwner {
        require(address(this).balance >= _weiAmount, "Insufficient balance!");
        payable(_to).transfer(_weiAmount);
    }

    function sendERC20Tokens(address _tokenAddress, address _to, uint256 _amount) external onlyOwner {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= _amount,
            "Insufficient ERC20 token balance!"
        );

        IERC20(_tokenAddress).transfer(_to, _amount);
    }
}
