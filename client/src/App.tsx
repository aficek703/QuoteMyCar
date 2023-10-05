import Header from "./components/Header";
import Form from "./components/Form";
function App() {
  return (
    <>
      <div>
        <div className="absolute inset-0 backdrop-blur-md"></div>
      </div>
      <div className="z-10 relative">
        <div className="flex items-center flex-col header">
          <Header />
        </div>
        <Form />
      </div>
    </>
  );
}

export default App;
