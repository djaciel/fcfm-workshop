// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    // Estructura para representar un candidato
    struct Candidate {
        uint id; // ID del candidato
        string name; // Nombre del candidato
        uint voteCount; // Cantidad de votos
        address candidateAddress; // Dirección del candidato
    }

    // Almacena los candidatos y sus IDs
    mapping(uint => Candidate) public candidates;
    // Almacena las direcciones de Ethereum de los votantes que han votado
    mapping(address => bool) public voters;

    // Contador de candidatos
    uint public candidatesCount;
    // Estado de la votación
    bool public votingClosed;
    // ID del candidato ganador
    uint public winningCandidateId;

    // Evento para registrar el voto
    event Voted(uint indexed candidateId);
    // Evento para indicar el cierre de la votación y al ganador
    event VotingClosed(uint winningCandidateId);

    constructor() {
        votingClosed = false;
    }

    // Función para agregar un candidato (solo el propietario)
    function addCandidate(string memory _name, address _candidateAddress) public onlyOwner {
        require(!votingClosed, "Voting is closed.");
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0, _candidateAddress);
    }

    // Función para obtener la información de un candidato
    function getCandidate(uint _candidateId) public view returns (Candidate memory) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        return candidates[_candidateId];
    }

    // Función para cerrar la votación (solo el propietario)
    function closeVoting() public onlyOwner {
        require(!votingClosed, "Voting is closed.");
        determineWinner();

        require(winningCandidateId != 0, "No winner.");

        votingClosed = true;
        emit VotingClosed(winningCandidateId);
        // Transferir las donaciones al ganador
        payable(candidates[winningCandidateId].candidateAddress).transfer(address(this).balance);
    }

    // Función para determinar al ganador o si hay un empate
    function determineWinner() private {
        uint _maxVotes;
        uint _winningCandidateId;
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > _maxVotes) {
                _maxVotes = candidates[i].voteCount;
                _winningCandidateId = i;
            } else if (candidates[i].voteCount == _maxVotes) {
                // Empate, marcar el ganador como 0
                _winningCandidateId = 0;
            }
        }
        winningCandidateId = _winningCandidateId;
    }

    // Función para votar por un candidato (si la votación está abierta)
    function vote(uint _candidateId) public payable {
        require(!votingClosed, "Voting is closed.");
        // Verificar que el votante no haya votado antes
        require(!voters[msg.sender], "You have already voted.");
        // Verificar que el candidato existe
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        // Registrar el voto
        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        // Emitir el evento de voto
        emit Voted(_candidateId);
    }

    // Función para obtener el saldo del contrato
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Función para permitir que el contrato reciba ETH
    receive() external payable {}
}
