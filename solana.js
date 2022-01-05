import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction
} from "@solana/web3.js";

const getWalletBalance = async (pubk) => {
    try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const balance = await connection.getBalance(new PublicKey(pubk));
    return balance/LAMPORTS_PER_SOL;
    } catch (err) {
        console.log(err);
    }
};

const transferSol = async (from, to , transferAmount) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(from.publicKey.toString()),
                toPubkey: new PublicKey(to.publicKey.toString()),
                lamports: transferAmount * LAMPORTS_PER_SOL,
            })
        );
        return await sendAndConfirmTransaction(
            connection,
            transaction,
            [from],
        );
    } catch (err) {
        console.log(err);
    }
}
const airDropSol = async (wallet, amount) => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(wallet.publicKey.toString()),
            amount* LAMPORTS_PER_SOL);
        await connection.confirmTransaction(fromAirDropSignature);
    } catch (err) {
        console.log(err);
    }
}
export {getWalletBalance,transferSol, airDropSol};