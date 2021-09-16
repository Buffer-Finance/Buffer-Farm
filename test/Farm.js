const { expectRevert, time } = require("@openzeppelin/test-helpers");

const Farm = artifacts.require("Farm");
const MockBEP20 = artifacts.require("libs/MockBEP20");

contract("Farm", ([alice, bob, carol, dev, minter]) => {
  beforeEach(async () => {
    this.syrup = await MockBEP20.new("LPToken", "LP1", "1000000", {
      from: minter,
    });

    this.reward = await MockBEP20.new("AToken", "AToken", "1000000", {
      from: minter,
    });

    this.chef = await Farm.new(
      this.syrup.address,
      this.reward.address,
      "40",
      "300",
      "400",
      {
        from: minter,
      }
    );
  });

  it("sous chef now", async () => {
    await this.reward.transfer(this.chef.address, "1000", { from: minter });

    await this.syrup.transfer(bob, "1000", { from: minter });
    await this.syrup.transfer(carol, "1000", { from: minter });
    await this.syrup.transfer(alice, "1000", { from: minter });
    assert.equal((await this.syrup.balanceOf(bob)).toString(), "1000");

    await this.syrup.approve(this.chef.address, "1000", { from: bob });
    await this.syrup.approve(this.chef.address, "1000", { from: alice });
    await this.syrup.approve(this.chef.address, "1000", { from: carol });

    await this.chef.deposit("10", { from: bob });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      "10"
    );

    await time.advanceBlockTo("300");

    await this.chef.deposit("30", { from: alice });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      "40"
    );
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      "40"
    );

    await time.advanceBlockTo("302");
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      "50"
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      "30"
    );

    await this.chef.deposit("40", { from: carol });
    assert.equal(
      (await this.syrup.balanceOf(this.chef.address)).toString(),
      "80"
    );
    await time.advanceBlockTo("304");
    //  bob 10, alice 30, carol 40
    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      "65"
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      "75"
    );
    assert.equal(
      (await this.chef.pendingReward(carol, { from: carol })).toString(),
      "20"
    );

    await this.chef.deposit("20", { from: alice }); // 305 bob 10, alice 50, carol 40
    await this.chef.deposit("30", { from: bob }); // 306  bob 40, alice 50, carol 40

    assert.equal(
      (await this.chef.pendingReward(bob, { from: bob })).toString(),
      "0"
    );
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      "20"
    );

    await this.chef.withdraw("20", { from: alice }); // 308 bob 40, alice 30, carol 40
    await this.chef.withdraw("30", { from: bob }); // 309  bob 10, alice 30, carol 40

    await this.chef.withdraw("10", { from: bob });
    await this.chef.withdraw("30", { from: alice });
    await expectRevert(
      this.chef.withdraw("50", { from: carol }),
      "amount exceeded"
    );
    await this.chef.deposit("30", { from: carol });

    await this.chef.withdraw("70", { from: carol });
  });

  it("emergencyWithdraw", async () => {
    await this.syrup.transfer(alice, "1000", { from: minter });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), "1000");

    await this.syrup.approve(this.chef.address, "1000", { from: alice });
    await this.chef.deposit("10", { from: alice });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), "990");
    await this.chef.emergencyWithdraw({ from: alice });
    assert.equal((await this.syrup.balanceOf(alice)).toString(), "1000");
    assert.equal(
      (await this.chef.pendingReward(alice, { from: alice })).toString(),
      "0"
    );
  });
});
