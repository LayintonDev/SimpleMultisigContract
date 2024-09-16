// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24; // Define the Solidity version

import "./Multisig.sol";

contract MultisigFactory {
    Multisig[] clones;

    function createMultisig(
        uint8 _quorum,
        address[] memory _validSigners
    ) external returns (Multisig newMultisig, uint numberOfClones) {
        require(_quorum > 1, "quorum is too small");
        require(_quorum <= _validSigners.length, "quorum is too big");

        newMultisig = new Multisig(_quorum, _validSigners);
        clones.push(newMultisig);
        numberOfClones = clones.length;
    }

    function getMultisigClones() external view returns (Multisig[] memory) {
        return clones;
    }

    function getAMultisigClone(uint _index) external view returns (Multisig) {
        return clones[_index];
    }
}
