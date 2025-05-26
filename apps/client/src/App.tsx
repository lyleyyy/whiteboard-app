import { type FormEvent } from "react";

function App() {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input placeholder="Writng something..." />
        <button type="submit">Waya</button>
      </form>
    </div>
  );
}

export default App;
