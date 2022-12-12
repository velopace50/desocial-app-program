import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert");
const { SystemProgram } = anchor.web3;

import { DesocialAppProgram } from "../target/types/desocial_app_program";

describe("desocial-app-program", () => {
  // Use a local provider.
  const provider = anchor.Provider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.DesocialAppProgram as Program<DesocialAppProgram>;

  it('can send a new message', async () => {
    let receiver = anchor.web3.Keypair.generate();
    let message = anchor.web3.Keypair.generate();
    await program.rpc.sendMessage('Happy Birthday', 'Hello, bro. Happy Birthday to you. This is Jie.', {
      accounts: {
        message: message.publicKey,
        author: program.provider.wallet.publicKey,
        receiver: receiver.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [message],
    });

    message = anchor.web3.Keypair.generate();
    receiver = anchor.web3.Keypair.generate();
    await program.rpc.sendMessage('Happy Sunday', 'Mum, Have a good weekend.', {
      accounts: {
        message: message.publicKey,
        author: program.provider.wallet.publicKey,
        receiver: receiver.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [message],
    });

    message = anchor.web3.Keypair.generate();
    receiver = anchor.web3.Keypair.generate();
    const filterMessage = receiver;
    await program.rpc.sendMessage('Happy Weekend', 'Dad, Have a good weekend.', {
      accounts: {
        message: message.publicKey,
        author: program.provider.wallet.publicKey,
        receiver: receiver.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [message],
    });

    // const messageAccounts = await program.account.message.all();
    // console.log('messageAccounts = ', messageAccounts);
    // console.log('messageAccounts.length = ', messageAccounts.length);

    const authorPublicKey = program.provider.wallet.publicKey
    const filterMessages = await program.account.message.all([
      {
        memcmp: {
          offset: 40, // Discriminator + auth.
          bytes: filterMessage.publicKey.toBase58(),
        }
      }
    ]);
    console.log('filterMessages = ', filterMessages);

    filterMessages.every(messageAccount => {
      console.log('filterMessage Account key = ', messageAccount.account.receiver.toBase58());
    });

    // // Fetch the account details of the created message.
    // const messageAccount = await program.account.message.fetch(message.publicKey);
    // console.log(messageAccount);
    //
    // // Ensure it has the right data.
    // assert.equal(messageAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
    // assert.equal(messageAccount.topic, 'Happy Birthday');
    // assert.equal(messageAccount.content, 'Hello, bro. Happy Birthday to you. This is Jie.');
    // assert.ok(messageAccount.timestamp);
  });

  // it("Is initialized!", async () => {
  //   // Add your test here.
  //   // The Account to create.
  //   const messageAccount = anchor.web3.Keypair.generate();
  //
  //   // Create the new account and initialize it with the program.
  //   // #region code-simplified
  //   const tx = await program.rpc.initialize({
  //     accounts: {
  //       messageAccount: messageAccount.publicKey,
  //       user: provider.wallet.publicKey,
  //       systemProgram: SystemProgram.programId,
  //     },
  //     signers: [messageAccount],
  //   });
  //
  //   // const tx = await program.rpc.initialize({});
  //   console.log("Your transaction signature", tx);
  //
  //   // Fetch the newly created account from the cluster.
  //   const account = await program.account.messageAccount.fetch(messageAccount.publicKey);
  //
  //   console.log('messageAccount Data = ', account.data);
  //   // Check it's state was initialized.
  //   // assert.ok(account.data.eq(new anchor.BN(38)));
  // });
});
