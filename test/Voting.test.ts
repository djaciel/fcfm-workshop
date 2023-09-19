import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Voting } from "../typechain-types";
import { ethers } from "hardhat";
import { expect } from "chai";

let owner: HardhatEthersSigner
let voterA: HardhatEthersSigner
let voterB: HardhatEthersSigner
let voterC: HardhatEthersSigner

let candidateA_address: string = ethers.constants.AddressZero
let candidateB_address: string = ethers.constants.AddressZero

let votingContract: Voting

describe("Voting", () => {
  before(async () => {
    [owner, voterA, voterB, voterC] = await ethers.getSigners()

    const Voting = await ethers.getContractFactory("Voting")
    votingContract = await Voting.deploy()
  })

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await votingContract.owner()).to.equal(await owner.getAddress())
    })

    it("Should set the right the candidates", async () => {
      await votingContract.addCandidate('candidateA', candidateA_address)
      await votingContract.addCandidate('candidateB', candidateB_address)

      const candidateA = await votingContract.getCandidate(1)
      const candidateB = await votingContract.getCandidate(2)

      expect(candidateA.name).to.equal('candidateA')
      expect(candidateA.candidateAddress).to.equal(candidateA_address)

      expect(candidateB.name).to.equal('candidateB')
      expect(candidateB.candidateAddress).to.equal(candidateB_address)
    })

    it("Should perform a vote", async () => {
      await votingContract.connect(voterA).vote(1)
      await votingContract.connect(voterB).vote(1, { value: 5000 })
      await votingContract.connect(voterC).vote(2, { value: 1000 })

      const candidateA = await votingContract.getCandidate(1)
      const candidateB = await votingContract.getCandidate(2)

      expect(candidateA.voteCount).to.equal(2)
      expect(candidateB.voteCount).to.equal(1)
    })

    it("Should not perform a vote if the voter has already voted", async () => {
      try {
        await votingContract.connect(voterA).vote(1)
      } catch (error: any) {
        expect(error.message).to.contains('You have already voted.')
      }
    })

    it("Should return the balance of the contract", async () => {
      const balance = await votingContract.getContractBalance()
      expect(balance).to.equal(6000)
    })

    it("Should only the owner determine the winner", async () => {
      try {
        await votingContract.connect(voterA).closeVoting()
      } catch (error: any) {
        expect(error.message).to.contains('Ownable: caller is not the owner')
      }
    })

    it("Should determine the winner", async () => {
      await votingContract.closeVoting()
      
      const winnerId = await votingContract.winningCandidateId()
      expect(winnerId).to.equal(1)
    })

    it("Should the winner receive the donations", async () => {
      const balance = await ethers.provider.getBalance(candidateA_address)
      expect(balance).to.equal(6000)
    })

    it("Should not add a candidate if the voting is closed", async () => {
      try {
        await votingContract.addCandidate('candidateC', candidateA_address)
      } catch (error: any) {
        expect(error.message).to.contains('Voting is closed.')
      }
    })

    it("Should not perform a vote if the voting is closed", async () => {
      try {
        await votingContract.connect(voterA).vote(1)
      } catch (error: any) {
        expect(error.message).to.contains('Voting is closed.')
      }
    })

    it("Should not close the voting if the voting is closed", async () => {
      try {
        await votingContract.closeVoting()
      } catch (error: any) {
        expect(error.message).to.contains('Voting is closed.')
      }
    })
  })
})