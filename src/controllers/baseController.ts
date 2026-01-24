import { Request, Response } from "express";
import { Model } from "mongoose";

class BaseController<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async post(req: Request, res: Response) {
    const dataToInsert = req.body;

    try {
      const insertedData = await this.model.create(dataToInsert);
      res.status(201).json(insertedData);
    } catch (error) {
      console.error(
        `An error occurred while creating the following data ${req.body}: `,
        error,
      );
      res.status(500).send(`An error occurred while creating data`);
    }
  }

  async getAll(req: Request, res: Response) {
    const filters = req.query;

    try {
      const data = await this.model.find(filters);

      res.send(data);
    } catch (error) {
      console.error("An error occurred while getting all data: ", error);
      res.status(500).send("An error occurred while getting all data");
    }
  }
}

export default BaseController;
