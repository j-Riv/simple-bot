import { Request, Response } from 'express';
import timer from 'timers';
import { createResponse, getWeather, postMessage } from '../utils';

export const respond = async (req: Request, res: Response): Promise<Response | undefined> => {
  console.log('someone pinged @');
  const data = req.body;
  console.log('DATA', data);

  if (data.type === 'MESSAGE') {
    let msg: string;
    const slashCommand = data.message.slashCommand;
    if (slashCommand) {
      if (slashCommand.commandId === '1') {
        msg = await getWeather(data.message.argumentText.trim());
      } else {
        msg = `There was an error processing the slash command.`;
      }
    } else {      
      const name = data.message.sender.displayName;
      const senderMessage = data.message.argumentText;
  
      const dm: string = senderMessage.toLowerCase();
      msg = await createResponse(dm, name);
    }
    // send message every 5 min
    // timer.setInterval(function () {
    //   postMessage(data.message.space.name, randomResponses[Math.floor(Math.random() * randomResponses.length)]);
    // }, 60000 * 5);

    return res.json({
      text: msg,
    });
  }
};
