// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public voters;
    uint256 public candidatesCount;
    
    event VoteCast(uint256 indexed candidateId, address voter);

    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender], "You have already voted!");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate!");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(_candidateId, msg.sender);
    }

    function getCandidate(uint256 _candidateId) public view returns (uint256, string memory, uint256) {
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }

    function getCandidatesCount() public view returns (uint256) {
        return candidatesCount;
    }
} 