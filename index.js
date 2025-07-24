//modulos externos
const chalk = require("chalk");
const inquirer = require("inquirer");

//modulos internos
const fs = require("fs");

console.log(chalk.bgCyan.black(" Accounts iniciado "));

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Fazer transação",
          "Cofrinho",
          "Sair",
        ],
      },
    ])
    .then((answers) => {
      const escolha = answers.action;
      switch (escolha) {
        case "Criar conta":
          pedeConta();
          break;

        case "Consultar saldo":
          consultarSaldo();
          break;

        case "Depositar":
          depositar();
          break;

        case "Sacar":
          sacar();
          break;

        case "Fazer transação":
          transaction();
          break;

        case "Cofrinho":
          cofrinho();
          break;

        case "Sair":
          sair();
          break;

        default:
          console.log("Ops! Algo deu errado.");
      }
    })
    .catch((error) => console.log(error));
}

function pedeConta() {
  console.log(chalk.bgCyan.black(` Obrigado por escolher nossos serviços! `));

  criarConta();
}

function criarConta() {
  inquirer
    .prompt([
      {
        name: "acc",
        message: "Defina o nome de usuário da sua conta:",
      },
    ])
    .then((account) => {
      const accountName = account.acc;

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (!fs.existsSync(`accounts/${accountName}.json`)) {
        fs.writeFileSync(
          `accounts/${accountName}.json`,
          '{"saldo": 0}',
          (err) => console.log(err)
        );

        console.log(
          chalk.bgGreen.black(` Parabéns! A conta ${accountName} foi criada! `)
        );
        operation();
      } else {
        console.log(
          chalk.bgRed.black(
            " Esse usuário já existe. Por favor, escolha outro nome. "
          )
        );
        criarConta();
      }
    })
    .catch((error) => console.log(error));
}

function consultarSaldo() {
  inquirer
    .prompt([
      {
        name: "val",
        message: "Primeiro, digite seu usuário:",
      },
    ])
    .then((validation) => {
      if (!validaConta(validation.val)) {
        consultarSaldo();
        return;
      }

      console.log(
        chalk.bgCyan.black(
          `Seu saldo é de: ${chalk.bgGreen.bold(
            balance(validation.val, "saldo")
          )}`
        )
      );

      operation();
    })
    .catch((error) => console.log(error));
}

function depositar() {
  inquirer
    .prompt([
      {
        name: "val",
        message: "Primeiro, digite o seu nome de usuário.",
      },
    ])
    .then((validation) => {
      if (!validaConta(validation.val)) {
        depositar();
        return;
      }
      inquirer
        .prompt([
          {
            name: "deposit",
            message: "Quanto você quer depositar? (ex: 1.000,40)",
          },
        ])
        .then((valor) => {
          const strDeposito = replace(valor.deposit);
          const deposito = Number(strDeposito);

          if (!isNan(deposito, strDeposito)) {
            depositar();
            return;
          }

          addAmount(validation.val, deposito, "saldo");

          console.log(chalk.bgGreen.black(" Depósito feito com sucesso! "));
          operation();
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}

function sacar() {
  inquirer
    .prompt([
      {
        name: "val",
        message: "Primeiro, digite o seu nome de usuário.",
      },
    ])
    .then((validation) => {
      if (!validaConta(validation.val)) {
        sacar();
        return;
      }
      inquirer
        .prompt([
          {
            name: "withdraw",
            message: "Quanto você quer sacar? (ex: 1.000,40)",
          },
        ])
        .then((valor) => {
          if (
            removeAmount(validation.val, valor.withdraw, sacar, "saldo") !==
            undefined
          ) {
            console.log(chalk.bgGreen.black(" Saque realizado com sucesso! "));
            operation();
          }
        });
    })
    .catch((error) => console.log(error));
}

function transaction() {
  inquirer
    .prompt([
      {
        name: "val",
        message: "Primeiro, digite o seu nome de usuário.",
      },
    ])
    .then((validation) => {
      if (!validaConta(validation.val)) {
        transaction();
        return;
      }

      inquirer
        .prompt([
          {
            name: "user",
            message: "Para qual conta Accounts você quer fazer a transação?",
          },
        ])
        .then((account) => {
          if (!validaConta(account.user)) {
            transaction();
            return;
          }

          inquirer
            .prompt([
              {
                name: "transaction",
                message: "Quanto você deseja transferir? (ex: 1.000,40)",
              },
            ])
            .then((valor) => {
              //Obs: a função removeAmount faz todo o processo de remover o dinheiro da conta e retorna a transação em número para continuar a operação
              const transacao = removeAmount(
                validation.val,
                valor.transaction,
                transaction,
                "saldo"
              );

              if (transacao !== undefined) {
                addAmount(account.user, transacao, "saldo");

                console.log(
                  chalk.bgGreen.black("Transação realizada com sucesso!")
                );

                operation();
              }
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    })
    .catch((error) => console.log(error));
}

function cofrinho() {
  inquirer
    .prompt([
      {
        name: "val",
        message: "Primeiro, digite o seu nome de usuário.",
      },
    ])
    .then((validation) => {
      if (!validaConta(validation.val)) {
        cofrinho();
        return;
      }

      const dados = JSON.parse(
        fs.readFileSync(`accounts/${validation.val}.json`, "utf8")
      );

      if (!dados.hasOwnProperty("cofrinho")) {
        dados.cofrinho = 0;

        fs.writeFileSync(
          `accounts/${validation.val}.json`,
          JSON.stringify(dados, null, 4)
        );
      }

      inquirer
        .prompt([
          {
            type: "list",
            name: "piggy",
            message: "Qual operação você deseja realizar no cofrinho?",
            choices: [
              "Transferir para o cofrinho",
              "Retirar do cofrinho",
              "Consultar valor",
              "Voltar",
            ],
          },
        ])
        .then((answers) => {
          const operacao = answers.piggy;
          const accountName = validation.val;
          switch (operacao) {
            case "Transferir para o cofrinho":
              depositPiggy(accountName);
              break;

            case "Retirar do cofrinho":
              withdrawPiggy(accountName);
              break;

            case "Consultar valor":
              console.log(
                chalk.bgCyan.black(
                  `Seu saldo no cofrinho é: ${chalk.bgGreen.bold(
                    balance(accountName, "cofrinho")
                  )}`
                )
              );

              operation();
              break;

            case "Voltar":
              operation();
              break;

            default:
              console.log("Ops! Algo deu errado.");
          }
        })
        .catch((error) => console.log(error));
    });
}

function sair() {
  console.log(
    chalk.bgCyan.black(" Obrigado por utilizar o Accounts. Volte sempre! ")
  );
  process.exit();
}

function depositPiggy(accountName) {
  const account = accountName;
  inquirer
    .prompt([
      {
        name: "depositPiggy",
        message:
          "Quanto você quer transferir do seu saldo para o cofrinho? (ex: 200,25)",
      },
    ])
    .then((valor) => {
      const cofrinhoDep = removeAmount(
        account,
        valor.depositPiggy,
        depositPiggy,
        "saldo"
      );

      if (cofrinhoDep !== undefined) {
        addAmount(account, cofrinhoDep, "cofrinho");

        console.log(
          chalk.bgGreen.black("Transferência realizada com sucesso!")
        );

        operation();
      }
    })
    .catch((error) => console.log(error));
}

function withdrawPiggy(accountName) {
  const account = accountName;
  inquirer
    .prompt([
      {
        name: "withdrawPiggy",
        message: "Quanto você deseja retirar do cofrinho? (ex: 200,25)",
      },
    ])
    .then((valor) => {
      const cofrinhoSaq = removeAmount(
        account,
        valor.withdrawPiggy,
        withdrawPiggy,
        "cofrinho"
      );

      if (cofrinhoSaq !== undefined) {
        addAmount(account, cofrinhoSaq, "saldo");

        console.log(
          chalk.bgGreen.black("Transferência realizada com sucesso!")
        );

        operation();
      }
    })
    .catch((error) => console.log(error));
}

function balance(accountName, property) {
  const dados = JSON.parse(
    fs.readFileSync(`accounts/${accountName}.json`, "utf8")
  );

  const saldo = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(dados[property]);

  return saldo;
}

function validaConta(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black(" Desculpe, esse usuário não existe. Tente novamente. ")
    );
    return false;
  }
  return true;
}

function replace(string) {
  if (isNaN(Number(string))) {
    const strReplaced = string.replace(/[,.]/g, (match) => {
      return match === "," ? "." : "";
    });
    return strReplaced;
  }

  return string;
}

function isShorter(balance, amount) {
  if (balance < amount) {
    console.log(
      chalk.bgRed.black(" Saldo insuficiente para a realização da operação. ")
    );
    return false;
  }
  return true;
}

function isNan(amount, strAmount) {
  if (isNaN(amount) || strAmount === "") {
    console.log(chalk.bgRed.black(" Digite somente números. "));
    return false;
  }
  return true;
}

function removeAmount(accountName, amount, parentFunction, property) {
  const strAmount = replace(amount);
  const numAmount = Number(strAmount);

  const dados = JSON.parse(
    fs.readFileSync(`accounts/${accountName}.json`, "utf8")
  );

  if (!isShorter(dados[property], numAmount)) {
    operation();
    return;
  }

  if (!isNan(numAmount, strAmount)) {
    parentFunction(accountName);
    return;
  }

  const intermediateData = dados[property] - numAmount;
  dados[property] = Number(intermediateData.toFixed(2));
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(dados, null, 4)
  );

  return numAmount;
}

function addAmount(accountName, numAmount, property) {
  const dados = JSON.parse(
    fs.readFileSync(`accounts/${accountName}.json`, "utf8")
  );

  const intermediateData = dados[property] + numAmount;
  dados[property] = Number(intermediateData.toFixed(2));
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(dados, null, 4)
  );

  return numAmount;
}
