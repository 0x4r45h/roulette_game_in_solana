import { Keypair } from "@solana/web3.js";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import {getWalletBalance,transferSol,airDropSol} from "./solana.js"
import { getReturnAmount, totalAmtToBePaid, randomNumber } from "./helper.js"

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("SOL Stake", {
                font: "Standard",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
    console.log(chalk.yellow`The max bidding amount is 2.5 SOL here`);
};
const userSecretKey = [
    95, 243, 208,  18,  67, 159, 143, 236, 122, 144, 245,
    128,  92, 135,  77, 147, 246,  89, 151, 125,  90,  40,
    69,  47,  12,  21,  59,  48, 223,  84,  60, 102, 132,
    30, 232, 142, 100,  66, 131,  14, 165, 218,   0, 196,
    255, 118, 212,  54,  32, 179,  21,   7, 236, 116, 189,
    203, 123,  36, 100, 226, 155, 140, 198,  23
];
const userWallet = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));


//Treasury
const treasurySecretKey = [
    3,  59, 170, 153, 180, 161, 139,  60, 211, 154, 182,
    128,  31, 200, 159,  33, 121, 136, 131, 230,   0, 211,
    21, 101, 209,  18,  14,  36,  93, 201,  97, 116, 153,
    173, 117, 171, 118,  42, 193, 134, 179, 129,  55, 182,
    65, 196, 212,  68, 198, 108, 143, 221, 124,  54, 252,
    205, 242, 176, 180,  43,  50,  65, 177,  67
];
const treasuryWallet = Keypair.fromSecretKey(Uint8Array.from(treasurySecretKey));


const askQuestions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "What is the amount of SOL you want to stake?",
        },
        {
            type: "rawlist",
            name: "RATIO",
            message: "What is the ratio of your staking?",
            choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
            filter: function(val) {
                return val.split(":")[1];
            },
        },
        {
            type:"number",
            name:"RANDOM",
            message:"Guess a random number from 1 to 5 (both 1, 5 included)",
            when:async (val)=>{
                if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                    console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
                    return false;
                }else{
                    // console.log("In when")
                    console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
                    const userBalance=await getWalletBalance(userWallet.publicKey.toString())
                    if(userBalance<totalAmtToBePaid(val.SOL)){
                        console.log(chalk.red`You don't have enough balance in your wallet`);
                        return false;
                    }else{
                        console.log(chalk.green`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};

const gameExecution=async ()=>{
    init();
    const generateRandomNumber=randomNumber(1,5);
    console.log("Generated number",generateRandomNumber);
    const answers=await askQuestions();
    if(answers.RANDOM){
        const paymentSignature=await transferSol(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`,chalk.green`${paymentSignature}`);
        if(answers.RANDOM===generateRandomNumber){
            //AirDrop Winning Amount
            await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
            //guess is successfull
            const prizeSignature=await transferSol(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
            console.log(chalk.green`Your guess is absolutely correct`);
            console.log(`Here is the price signature `,chalk.green`${prizeSignature}`);
        }else{
            //better luck next time
            console.log(chalk.yellowBright`Better luck next time`)
        }
    }
}

gameExecution()