use anchor_lang::prelude::*;
use std::string::String;
use std::iter::Iterator;
use std::convert::Into;
use std::result::Result::Err;

declare_id!("G43omJiNp5Mx4EHDTs6PwXeHVV38babx1Kc2zMLa5G7G");

#[program]
pub mod desocial_app_program {
    use super::*;

    pub fn send_message(ctx: Context<SendMessage>, topic: String, content: String) -> Result<()> {
        let message: &mut Account<Message> = &mut ctx.accounts.message;
        let author: &Signer = &ctx.accounts.author;
        let receiver: &AccountInfo = &ctx.accounts.receiver;
        let clock: Clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(error!(ErrorCode::TopicTooLong));
        }

        if content.chars().count() > 280 {
            return Err(error!(ErrorCode::ContentTooLong));
        }

        message.author = *author.key;
        message.receiver = *receiver.key;
        message.timestamp = clock.unix_timestamp;
        message.topic = topic;
        message.content = content;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(init, payer = author, space = Message::LEN)]
    pub message: Account<'info, Message>,
    #[account(mut)]
    pub author: Signer<'info>,
    /// CHECK:message receiver account
    pub receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

// 1. Define the structure of the Message account.
#[account]
pub struct Message {
    pub author: Pubkey,
    pub receiver: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
}

// 2. Add some useful constants for sizing propeties.
const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.

// 3. Add a constant on the Message account that provides its total size.
impl Message {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + PUBLIC_KEY_LENGTH // Receiver.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH; // Content.
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}
