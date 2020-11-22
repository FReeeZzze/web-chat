import express from "express";

const handleError = (errCode: number, err: string, res: express.Response): express.Response => {
  return res.status(errCode).json({
    Error: err,
    message: 'Возникла непредвиденная ошибка!',
    status: 'error'
  });
};

export default handleError;
