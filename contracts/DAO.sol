// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/utils/IVotes.sol";


contract DAO is 
    Governor,
    GovernorVotes, 
    GovernorVotesQuorumFraction, 
    GovernorCountingSimple,
    GovernorSettings,
    GovernorTimelockControl {

        constructor(
            IVotes _token,
            TimelockController _timelock,
            uint256 _votingDelay,
            uint256 _votingPeriod,
            uint256 _proposalThreshold,
            uint256 _quorumPercentage
        ) 
            Governor("MyGovernor")
            GovernorVotes(_token)
            GovernorVotesQuorumFraction(_quorumPercentage)
            GovernorTimelockControl(_timelock)
            GovernorSettings(_votingDelay, _votingPeriod, _proposalThreshold)
            {}

        /* 
            All the functions below are required to be override as they are 
            present in two base contracts.
        */ 
        function _cancel(
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        ) internal override(Governor, GovernorTimelockControl) returns(uint256) {
            return super._cancel(targets, values, calldatas, descriptionHash);
        }

        function _execute(
            uint256 proposalId,
            address[] memory targets,
            uint256[] memory values,
            bytes[] memory calldatas,
            bytes32 descriptionHash
        ) internal override(Governor, GovernorTimelockControl) {
            super._execute(proposalId, targets, values, calldatas, descriptionHash);
        }

        function _executor() internal view override(Governor, GovernorTimelockControl) returns(address) {
            return super._executor();
        }

        function proposalThreshold() public view override(Governor, GovernorSettings) returns(uint256) {
            return super.proposalThreshold();
        }

        function state(
            uint256 proposalId
        ) public view override(Governor, GovernorTimelockControl) returns(ProposalState) {
            return super.state(proposalId);
        }

        function supportsInterface(
            bytes4 interfaceId
        ) public view override(Governor, GovernorTimelockControl) returns(bool) {
            return super.supportsInterface(interfaceId);
        }

}
