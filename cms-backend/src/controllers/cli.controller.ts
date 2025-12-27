// src/controllers/cli.controller.ts
import { Request, Response } from "express";
import { parseCommand, execCommand } from "../services/cli.service";

// export async function adminCliHandler(req: Request, res: Response) {
//   const actorId = (req as any).user?.id;
//   try {
//     const body = req.body;
//     const cmd: string = (body && body.command) || "";
//     if (!cmd)
//       return res
//         .status(400)
//         .json({
//           message: 'Missing command in request body: { command: "..." }',
//         });

//     const parsed = parseCommand(cmd);
//     const result = await execCommand(parsed, actorId);
//     return res.status(200).json({ ok: true, result });
//   } catch (err: any) {
//     // err may be {status, message}
//     return res
//       .status(err.status ?? 400)
//       .json({ message: err.message ?? "CLI command failed" });
//   }
// }
export async function adminCliHandler(req: Request, res: Response) {
  const actorId = (req as any).user?.id;
  try {
    const body = req.body;
    const cmd: string = (body && body.command) || "";
    if (!cmd)
      return res.status(400).json({
        message: 'Missing command in request body: { command: "..." }',
      });

    // parse and log parsed object for debugging
    let parsed;
    try {
      parsed = parseCommand(cmd);
    } catch (parseErr: any) {
      console.error("CLI parse error for command:", cmd, "\nerror:", parseErr);
      // audit could be added here
      return res
        .status(parseErr.status ?? 400)
        .json({ message: parseErr.message ?? "Parse failed" });
    }

    console.debug("CLI parsed payload:", JSON.stringify(parsed, null, 2));
    const result = await execCommand(parsed, actorId);
    return res.status(200).json({ ok: true, result });
  } catch (err: any) {
    // log full stack so we can pinpoint the .map location
    console.error(
      "CLI execution error. actor=",
      actorId,
      "command=",
      req.body?.command,
      "\n",
      err && (err.stack || err)
    );
    return res
      .status(err.status ?? 400)
      .json({ message: err.message ?? "CLI command failed" });
  }
}
