// One request at a time; discard reads that overlap a local cooking change.
export function createEveningSync({read, apply, onError, version, blocked, interval=5000, schedule=setTimeout, cancel=clearTimeout}) {
  let stopped=false, paused=false, running=false, timer, epoch=0, reconnect=false;
  async function refresh() {
    if(stopped || paused || running) return;
    cancel(timer);
    running=true;
    const revision=version();
    const connection=epoch;
    try {
      if(!blocked()) {
        const night=await read();
        if(!stopped && !paused && connection===epoch && !blocked() && revision===version()) apply(night);
      }
    } catch(error) {
      if(!stopped && !paused && connection===epoch && !blocked() && revision===version()) onError(error);
    } finally {
      running=false;
      if(!stopped && !paused) {timer=schedule(refresh,reconnect?0:interval);reconnect=false;}
    }
  }
  return {
    refresh,
    setActive(active) { if(paused===!active)return; epoch++;paused=!active;cancel(timer);if(active){if(running)reconnect=true;else void refresh();} },
    stop() { stopped=true; cancel(timer); }
  };
}
