export class AgentWebSocket {
  constructor(url="ws://localhost:8000/ws/agent") {
    this.url=url;
    this.ws=null;
    this.listeners=[];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws=new WebSocket(this.url);
      
      this.ws.onopen=() => {
        console.log("WebSocket connected");
        resolve(true);
      };

      this.ws.onmessage=(event) => {
        try {
          const data=JSON.parse(event.data);
          this.listeners.forEach((cb) => cb(data));
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      this.ws.onerror=(err) => {
        console.error("WebSocket error:", err);
        reject(err);
      };

      this.ws.onclose=() => {
        console.log("WebSocket closed");
      };
    });
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners=this.listeners.filter((cb) => cb !== callback);
    };
  }

  send(type, payload={}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn("WebSocket not open. Cannot send:", type);
    }
  }

  startAgent(config) {
    this.send("start", config);
  }

  stopAgent() {
    this.send("stop");
  }

  pauseAgent() {
    this.send("pause");
  }

  resumeAgent() {
    this.send("resume");
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
