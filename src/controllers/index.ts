import { Request, Response } from 'express';
import timer from 'timers';
import { getWeather, postMessage } from '../utils';
import randomResponses from '../helpers/random-responses';

const createResponse = async (dm: string, name: string): Promise<string> => {
  const greetings: string[] = ['hello', 'hi', 'hey', 'hola'];
  const words: string[] = ['problem', 'issue', "does't work", "didn't work", 'working'];
  const hw: string[] = ['computer', 'printer', 'internet'];
  const sw: string[] = ['netsuite', 'shopify'];
  if (greetings.some(v => dm.includes(v))) {
    return `Hello ${name} how are you?`;
  } else if (sw.some(v => dm.includes(v))) {
    return `I see your having some sort of software issue. Please email or message jriv@suavecito.com for help.`;
  } else if (hw.some(v => dm.includes(v))) {
    return `I see your having some sort of hardware issue. Have you turned it off and on again? If you continue having issues please email or message jorge@suavecito.com for help.`;
  } else if (words.some(v => dm.includes(v))) {
    return `I see your having some sort of problem please message someone better equiped to help you. I'm not that smart yet.`;
  } else if (dm.includes('weather')) {
    return await getWeather();
  } else {
    return randomResponses[Math.floor(Math.random() * randomResponses.length)];
  }
};

export const respond = async (req: Request, res: Response): Promise<Response | undefined> => {
  console.log('someone pinged @');
  const data = req.body;

  if (data.type === 'MESSAGE') {
    const name = data.message.sender.displayName;
    const senderMessage = data.message.argumentText;

    const dm: string = senderMessage.toLowerCase();
    const msg = await createResponse(dm, name);
    // send message every 5 min
    // timer.setInterval(function () {
    //   postMessage(data.message.space.name, randomResponses[Math.floor(Math.random() * randomResponses.length)]);
    // }, 60000 * 5);

    return res.json({
      text: msg,
    });
  }
};
