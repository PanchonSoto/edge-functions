import type {Handler, HandlerEvent, HandlerContext} from '@netlify/functions';


const notify= async(message: string)=> {

    const body = {
        content: message,
        embeds: [
            {
                image: { url: 'https://media1.tenor.com/m/A15H8E1VUh8AAAAC/github-cat.gif' }
            }
        ]
    }

    const res = await fetch(process.env.DISCORD_WEBHOOK_URL ?? '', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(body),

    });

    if(!res.ok) {
        console.log('Error sending message to discord');
        return false;
    }

    return true;

}

const onStar =(payload: any)=>{

    let message: string = '';
    const {action, sender, repository, starred_at} = payload;


    message = `User ${sender.login} ${action} star on ${repository.full_name}`;



    return message;
}

const onIssue = (payload: any)=> {

    const { action, issue } = payload;

    if(action==='opened') {
        return `An issue was opened with this title ${issue.title}`;     
    }

    if(action==='closed') {
        return `An issue was closed by ${issue.user.login}`;     
    }

    if(action==='reopened') {
        return `An issue was reopened by ${issue.user.login}`;     
    }

    return `Unhandled action for the issue event ${action}`;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {


    const githubEvent = event.headers["x-github-event"] ?? 'unknown';  
    const payload = JSON.parse(event.body ?? '{}');
    let message: string;

    switch (githubEvent) {

        case 'star':
            message = onStar(payload);    
        break;

        case 'issues':
            message = onIssue(payload);
        break;
    
        default:
            message = `Unknown event ${githubEvent}`;
        break;
    }

    await notify(message);
    console.log('Hola mundo desde los logs de netlify (hello handler)')


    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Function discord',
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }

};

export {handler};
