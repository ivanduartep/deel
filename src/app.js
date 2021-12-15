const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Op } = require("sequelize");
const { sequelize } = require("./model");
const { getProfile } = require("./middleware/getProfile");
const app = express();
const { isValidDate, uniqueValues } = require("./utils");

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

/**
 * @returns profile by User Id
 */
app.post("/login", async (req, res) => {
  const { id } = req.body;
  const { Profile } = req.app.get("models");
  const profile = await Profile.findOne({
    where: { id },
  });
  if (!profile) return res.status(401).end();
  res.json(profile);
});

/**
 * @returns contract by id
 */
app.get("/contracts/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const { dataValues: profile } = req.profile;
  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        {
          clientId: profile.id,
        },
        {
          contractorId: profile.id,
        },
      ],
    },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

/**
 * @returns list of constracts
 * belonging to a user (client or contractor)
 */
app.get("/contracts", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { dataValues: profile } = req.profile;
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        {
          clientId: profile.id,
        },
        {
          contractorId: profile.id,
        },
      ],
      status: {
        [Op.or]: ["new", "in_progress"],
      },
    },
  });
  res.json(contracts);
});

/**
 * @returns All unpaid jobs for a user
 */
app.get("/jobs/unpaid", getProfile, async (req, res) => {
  const { Contract, Job } = req.app.get("models");
  const { dataValues: profile } = req.profile;
  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        {
          clientId: profile.id,
        },
        {
          contractorId: profile.id,
        },
      ],
      status: {
        [Op.or]: ["new", "in_progress"],
      },
    },
  });

  const contractIds = contracts.map(({ dataValues }) => dataValues.id);

  const jobs = await Job.findAll({
    where: {
      contractId: {
        [Op.or]: contractIds,
      },
      paid: {
        [Op.or]: [false, null],
      },
    },
  });

  res.json(jobs);
});

/**
 * Pay for a job
 */
app.post("/jobs/:job_id/pay", getProfile, async (req, res) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { dataValues: profile } = req.profile;
  const { job_id: id } = req.params;
  if (profile.type !== "client") {
    return res.status(401, "Only clients can perform this operation").end();
  }

  const contracts = await Contract.findAll({
    where: {
      [Op.or]: [
        {
          clientId: profile.id,
        },
      ],
      status: {
        [Op.or]: ["new", "in_progress"],
      },
    },
  });

  if (contracts.length < 1) {
    return res
      .status(404, "We can't found any contract associated with you")
      .end();
  }

  const contractIds = contracts.map(({ dataValues }) => dataValues.id);

  const job = await Job.findOne({
    where: {
      contractId: {
        [Op.or]: contractIds,
      },
      paid: {
        [Op.or]: [false, null],
      },
      id,
    },
  });

  if (!job) {
    return res
      .status(404, "We can't found any job associated with that id")
      .end();
  }

  const { price } = job;
  const { balance } = profile;

  if (price > balance) {
    return res
      .status(402, "You don't have enough funds for pay this job")
      .end();
  }

  const contractSelected = contracts.filter(({ dataValues }) => {
    return dataValues.id == job.dataValues.ContractId;
  })[0];

  const contractorId = contractSelected.dataValues.ContractorId;

  // Get contractor
  const contractor = await Profile.findOne({
    where: {
      id: contractorId,
    },
  });

  // update job to paid
  await Job.update(
    { paid: true, paymentDate: new Date() },
    {
      where: {
        id,
      },
    }
  );

  // update client balance
  await Profile.update(
    { balance: balance - price },
    {
      where: {
        id: profile.id,
      },
    }
  );

  // update contractor balance
  await Profile.update(
    { balance: contractor.balance + price },
    {
      where: {
        id: contractorId,
      },
    }
  );

  res.json({
    message: "Job paid!",
  });
});

/**
 * Deposits money in client account
 */
app.post("/balances/deposit/:userId", getProfile, async (req, res) => {
  const { Contract, Job, Profile } = req.app.get("models");
  const { userId } = req.params;
  const { toDeposit } = req.body;
  const { dataValues: profile } = req.profile;

  if (!toDeposit || isNaN(toDeposit) || toDeposit <= 0) {
    return res
      .status(403, "Please specify a positive value for your deposit")
      .end();
  }

  const userToDepositResponse = await Profile.findOne({
    where: {
      id: userId,
    },
  });

  const userToDeposit = userToDepositResponse.dataValues;

  if (!userToDeposit || userToDeposit.type !== "client") {
    return res.status(404, "We can't found a client with that id").end();
  }

  let maxToDeposit = Infinity;

  if (profile.type === "client") {
    const contracts = await Contract.findAll({
      where: {
        clientId: profile.id,
        status: {
          [Op.or]: ["new", "in_progress"],
        },
      },
    });

    if (contracts.length > 0) {
      const contractIds = contracts.map(({ dataValues }) => dataValues.id);
      const jobs = await Job.findAll({
        where: {
          contractId: {
            [Op.or]: contractIds,
          },
          paid: {
            [Op.or]: [false, null],
          },
        },
      });

      if (jobs.length > 0) {
        const jobsAmountToPay = jobs
          .map(({ dataValues }) => dataValues.price)
          .reduce((prev, current) => prev + current);

        maxToDeposit = jobsAmountToPay * 0.25;
      } else {
        maxToDeposit = 0;
      }
    }
  }

  if (toDeposit >= maxToDeposit) {
    return res
      .status(401, `You can't deposit more than $${maxToDeposit}`)
      .end();
  }

  await Profile.update(
    {
      balance: userToDeposit.balance + toDeposit,
    },
    {
      where: {
        id: userToDeposit.id,
      },
    }
  );

  res.json({
    message: "Sucessful Deposit!",
  });
});

/**
 * @returns The profession that earned the most money
 */
app.get("/admin/best-profession", getProfile, async (req, res) => {
  const { start, end } = req.query;
  const { Contract, Job, Profile } = req.app.get("models");

  if (!start || !end) {
    return res.send(401, "Query params start and end are required").end();
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return res
      .send(401, "start and/or end query params are not valid dates")
      .end();
  }

  const jobsResponse = await Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  if (jobsResponse.length === 0) {
    return res.send(404, "We can't found any job in that range");
  }

  const jobs = jobsResponse.map(({ dataValues }) => dataValues);

  const contractsResponse = await Contract.findAll({
    where: {
      id: {
        [Op.or]: jobs.map(({ ContractId }) => ContractId),
      },
    },
  });

  const contracts = contractsResponse.map(({ dataValues }) => dataValues);

  const contractorsId = contracts
    .map(({ ContractorId }) => ContractorId)
    .filter(uniqueValues);

  const contractorsEarned = {};

  // Getting sum of money earned for each contractor
  contractorsId.map((id) => {
    const contractsIdForContractor = contracts
      .filter(({ ContractorId }) => ContractorId === id)
      .map(({ id }) => id);

    const jobsPriceForContractor = jobs
      .filter(({ ContractId }) => contractsIdForContractor.includes(ContractId))
      .map(({ price }) => price);

    const totalContractorEarned = jobsPriceForContractor.reduce(
      (prev, current) => prev + current
    );

    contractorsEarned[id] = totalContractorEarned;
  });

  const bestProfessionalId = Object.keys(contractorsEarned).reduce(
    (prev, current) =>
      contractorsEarned[prev] > contractorsEarned[current] ? prev : current
  );

  const bestProfessional = await Profile.findOne({
    where: {
      id: bestProfessionalId,
    },
  });

  res.json({
    ...bestProfessional.dataValues,
    earnedAmount: contractorsEarned[bestProfessionalId],
  });
});

/**
 * @returns The profession that earned the most money
 */
app.get("/admin/best-clients", getProfile, async (req, res) => {
  const { start, end } = req.query;
  const limit = req.query.limit ? req.query.limit : 2;
  const { Contract, Job, Profile } = req.app.get("models");

  if (!start || !end) {
    return res.send(401, "Query params start and end are required").end();
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return res
      .send(401, "start and/or end query params are not valid dates")
      .end();
  }

  const jobsResponse = await Job.findAll({
    where: {
      paid: true,
      paymentDate: {
        [Op.between]: [startDate, endDate],
      },
    },
  });

  if (jobsResponse.length === 0) {
    return res.send(404, "We can't found any job in that range");
  }

  const jobs = jobsResponse.map(({ dataValues }) => dataValues);

  const contractsResponse = await Contract.findAll({
    where: {
      id: {
        [Op.or]: jobs.map(({ ContractId }) => ContractId),
      },
    },
  });

  const contracts = contractsResponse.map(({ dataValues }) => dataValues);

  const clientsId = contracts
    .map(({ ClientId }) => ClientId)
    .filter(uniqueValues);

  const clientsPaid = {};

  // Getting sum of money paid for each client
  clientsId.map((id) => {
    const contractsIdForClient = contracts
      .filter(({ ClientId }) => ClientId === id)
      .map(({ id }) => id);

    const jobsPriceForClient = jobs
      .filter(({ ContractId }) => contractsIdForClient.includes(ContractId))
      .map(({ price }) => price);

    const totalClientPaid = jobsPriceForClient.reduce(
      (prev, current) => prev + current
    );

    clientsPaid[id] = totalClientPaid;
  });

  const clientsPaidSorted = Object.keys(clientsPaid)
    .sort((a, b) => clientsPaid[b] - clientsPaid[a])
    .slice(0, limit);

  const bestClients = await Promise.all(
    clientsPaidSorted.map(async (id) => {
      const clientResponse = await Profile.findOne({
        where: {
          id,
        },
      });

      const client = clientResponse.dataValues;

      return {
        id,
        fullName: `${client.firstName} ${client.lastName}`,
        paid: clientsPaid[id],
      };
    })
  );

  res.json(bestClients);
});

module.exports = app;
