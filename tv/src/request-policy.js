export function mayCancelRequest(path,method='GET'){return method==='GET'||['ai','recommendations','browse'].includes(path)||path.endsWith('/match');}
export function cancelPending(pending){for(const [controller,cancellable] of pending)if(cancellable)controller.abort('cancelled');}
