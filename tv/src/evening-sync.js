// One request at a time; discard reads that overlap a local cooking change.
export function createEveningSync({read, apply, onError, version, blocked, interval=5000, schedule=setTimeout, cancel=clearTimeout}) {
  let stopped=false, paused=false, running=false, timer;
  async function refresh() {
    if(stopped || paused || running) return;
    cancel(timer);
    running=true;
    const revision=version();
    try {
      if(!blocked()) {
        const night=await read();
        if(!stopped && !paused && !blocked() && revision===version()) apply(night);
      }
    } catch(error) {
      if(!stopped && !paused) onError(error);
    } finally {
      running=false;
      if(!stopped && !paused) timer=schedule(refresh,interval);
    }
  }
  return {
    refresh,
    setActive(active) { paused=!active; cancel(timer); if(active) void refresh(); },
    stop() { stopped=true; cancel(timer); }
  };
}
