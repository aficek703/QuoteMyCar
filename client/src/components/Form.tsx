import React, { useEffect, useState } from "react";
import SlotCounter from "react-slot-counter";
import question from "../assets/question.png";

interface Make {
  id: number;
  name: string;
}

interface Model {
  id: number;
  year: number;
  make: string;
  model: string;
  type: string;
}

interface FormData {
  carYear: string;
  carMake: string;
  carModel: string;
  driverAge: string;
  mileage: string;
  driverAccident: string;
  creditScore: string;
  locationRisk: string;
}

export default function Form() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [selectedMake, setSelectedMake] = useState<string | null>(null);

  let baseRate = 1000;
  const [actualRate, setActualRate] = useState<number>(0);
  let formData: FormData = {} as FormData;

  useEffect(() => {
    fetch("https://getmycarinsurancequote.onrender.com/makes")
      .then((response) => response.json())
      .then((data) => {
        console.log(data.data);
        setMakes(data.data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleMakeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();

    setSelectedMake(e.target.value);
    await fetch(
      `https://car-data.p.rapidapi.com/cars?limit=10&page=0&make=${e.target.value}`,
      {
        headers: {
          "X-RapidAPI-Key":
            "6996e4958dmshe7ace470eb00668p12c058jsn27dcbf0bf91f",
          "X-RapidAPI-Host": "car-data.p.rapidapi.com",
        },
      }
    )
      .then((response) => response.json())
      .then((data: Model[]) => {
        setModels([
          ...new Set(
            data.map((model) => {
              return model.type;
            })
          ),
        ]);
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    fetch(
      `https://getmycarinsurancequote.onrender.com/years?make=${selectedMake}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setYears(data);
      })
      .catch((error) => console.error("Error:", error));
  };
  console.log(models);
  return (
    <>
      <div className="flex w-full justify-center">
        <div className="flex items-center mt-16 md:mt-24 text-lg rounded-lg flex-col w-62">
          {actualRate == 0 ? (
            <span className="text-center italic mx-2">
              Enter your information below to recieve an estimated monthly car
              insurance quote!
            </span>
          ) : (
            <>
              <span className="mb-6 ">
                YOUR ESTIMATED CAR INSURANCE RATE IS:
              </span>
              <div className="flex md:flex-row flex-col items-center">
                <SlotCounter
                  value={`$${(actualRate / 12).toFixed(2)}/month`}
                  startValueOnce={true}
                  startValue={0}
                  containerClassName={"rateCounter"}
                />
                <img
                  src={question}
                  className="w-12 p-2 ml-4 questionIcon peer hover:bg-slate-100 rounded-[24px]"
                />
                <span className="questionPopUp peer-hover:visible invisible absolute md:mt-32 mt-24 mx-4 bg-slate-100 p-2 rounded-lg text-center">
                  This is only an estimate of what your insurance quote&nbsp;
                  <b>MIGHT</b> be. Actual insurance quotes are made with much
                  more complex algorithms then the one used here.
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-16  flex justify-center items-start">
        <form
          className="form pb-6 p-4 shadow-xl text-black mb-6 mx-4 h-[45vh] overflow-y-scroll md:h-full md:overflow-y-auto"
          onSubmit={(e) => {
            e.preventDefault();
            if (
              sessionStorage.getItem("formDataSession") ==
              JSON.stringify(formData)
            ) {
              return;
            }
            formData = Object.fromEntries([
              ...new FormData(e.target as HTMLFormElement),
            ]) as any as FormData;
            const carAge =
              new Date().getFullYear() - parseInt(formData.carYear);
            const carMakes = [
              "Alfa Romeo",
              "Aston Martin",
              "Audi",
              "Bentley",
              "BMW",
              "Bugatti",
              "Ferrari",
              "Lamborghini",
              "Land Rover",
              "Lexus",
              "Maserati",
              "Maybach",
              "McLaren",
              "Mercedes-Benz",
              "Porsche",
              "Rolls-Royce",
              "Tesla",
            ];

            const ageFactor =
              formData.driverAge === "Younger than 25" ? 1.5 : 1;
            const vehicleAgeFactor = carAge > 10 ? 1.2 : 1;
            const mileageFactor =
              formData.mileage === "0 - 40,000"
                ? 1.1
                : formData.mileage == "40,000 - 80,000"
                ? 1.05
                : 1;
            const drivingRecordFactor =
              formData.driverAccident === "Yes, I have" ? 1.2 : 1;
            const creditScoreFactor =
              formData.creditScore === "Below 650" ? 1.2 : "800+" ? 0.8 : 1;
            const locationRiskFactor =
              formData.locationRisk === "Very Often"
                ? 1.5
                : formData.locationRisk === "Often"
                ? 1.25
                : formData.locationRisk === "Sometimes"
                ? 1.1
                : 1;
            const carMakeFactor = carMakes.includes(formData.carMake) ? 1.2 : 1;

            const vehicleTypeFactor =
              formData.carModel === "Pickup"
                ? 1.2
                : formData.carModel === "Van/Minivan"
                ? 1
                : formData.carModel === "Sedan"
                ? 1.1
                : formData.carModel === "SUV"
                ? 1.2
                : formData.carModel === "Coupe" ||
                  "Sedan, Coupe" ||
                  "Sedan, Coupe, Convertiable" ||
                  "Convertible, Hatchback" ||
                  "Coupe, Convertible"
                ? 1.25
                : formData.carModel === "Wagon" || "Wagon, Sedan, Hatchback"
                ? 1
                : 1;

            baseRate *= ageFactor;
            baseRate *= vehicleAgeFactor;
            baseRate *= mileageFactor;
            baseRate *= drivingRecordFactor;
            baseRate *= creditScoreFactor;
            baseRate *= locationRiskFactor;
            baseRate *= carMakeFactor;
            baseRate *= vehicleTypeFactor;
            setActualRate(baseRate);

            console.log(`Rate: $${(baseRate / 12).toFixed(2)}`);
            sessionStorage.setItem("formDataSession", JSON.stringify(formData));
            window.scrollTo(0, 250);
          }}
        >
          {actualRate == 0 ? (
            ""
          ) : (
            <>
              <div className=" my-8 justify-center w-full md:flex hidden">
                <button
                  type="submit"
                  className="submitBtn w-48 h-12 text-[#ffffffa4] hoverFX text-black hover:text-white"
                >
                  GO
                </button>
              </div>
            </>
          )}
          <div className="w-full">
            <div>
              <label className="text-opacity-100 ">Make:</label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                required
                name="carMake"
                className="block bg-white border carMake border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
                onChange={handleMakeChange}
              >
                <option disabled selected value="">
                  Select Make
                </option>
                {makes.map((make) => (
                  <option key={make.id}>{make.name}</option>
                ))}
              </select>
            </div>
            {selectedMake ? (
              <>
                <div className="mt-6">
                  <label className="text-opacity-100 ">Model Type:</label>
                </div>
                <div className="w-full dropdownMenu">
                  <select
                    required
                    name="carModel"
                    placeholder="Select Your Model"
                    className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
                    onChange={handleModelChange}
                  >
                    <option disabled selected value="">
                      Select Model
                    </option>
                    {models.map((model) => (
                      <option key={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              ""
            )}

            <div className="mt-6">
              <label className="text-opacity-100 ">Year:</label>
            </div>

            <div className="w-full dropdownMenu">
              <select
                name="carYear"
                required
                placeholder="Select Year"
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="">
                  Select Year
                </option>

                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <label className="text-opacity-100 ">Mileage:</label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                required
                name="mileage"
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="" id="modelOption">
                  Select Mileage Range
                </option>
                <option>0 - 40,000</option>
                <option>40,000 - 80,000</option>
                <option>80,000+</option>
              </select>
            </div>

            <div className="mt-6">
              <label className="text-opacity-100 ">Driver Age:</label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                required
                name="driverAge"
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="">
                  Select Age Range
                </option>
                <option>Older than 25</option>
                <option>Younger than 25</option>
              </select>
            </div>
            <div className="mt-6">
              <label className="text-opacity-100 ">
                Have you been in an accident or commited a violation recently?:
              </label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                name="driverAccident"
                required
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="">
                  Select
                </option>
                <option>Yes, I have</option>
                <option>No, I haven't</option>
              </select>
            </div>
            <div className="mt-6">
              <label className="text-opacity-100 ">Credit Score:</label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                name="creditScore"
                required
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="">
                  Select
                </option>
                <option>800+</option>
                <option>650 - 800</option>
                <option>Below 650</option>
              </select>
            </div>
            <div className="mt-6">
              <label className="text-opacity-100 ">
                Are car thefts common around your location?:
              </label>
            </div>
            <div className="w-full dropdownMenu">
              <select
                name="locationRisk"
                required
                className="block bg-white border border-custom-green rounded-md shadow-sm pl-3 pr-10 py-2 text-base cursor-default focus:outline-none sm:text-sm w-full h-12 hover:cursor-pointer"
              >
                <option disabled selected value="">
                  Select
                </option>
                <option>Very Often</option>
                <option>Often</option>
                <option>Sometimes</option>
                <option>Barely Ever</option>
                <option>Never</option>
              </select>
            </div>
          </div>
          <div className="flex mt-8 justify-center w-full">
            <button
              type="submit"
              className="submitBtn w-48 h-12 text-[#ffffffa4] hoverFX text-black hover:text-white"
            >
              GO
            </button>
          </div>
        </form>
      </div>
      <div className="flex w-full justify-center">
        <div className="flex items-center mt-6 mb-24 text-lg rounded-lg flex-col w-62">
          {actualRate == 0 ? (
            ""
          ) : (
            <>
              <div className="hidden md:flex md:items-center md:flex-col">
                <span className="mb-6">YOUR ESTIMATED RATE IS:</span>
                <span className="mb-6 ">
                  <div className="flex flex-row items-center">
                    <SlotCounter
                      value={`$${(actualRate / 12).toFixed(2)}/month`}
                      startValueOnce={true}
                      startValue={0}
                      containerClassName={"rateCounter"}
                    />
                    <img
                      src={question}
                      className="w-12 p-2 ml-4 questionIcon peer hover:bg-slate-100 rounded-[24px]"
                    />
                    <span className="questionPopUp mx-4 peer-hover:visible invisible absolute mt-32 bg-slate-100 p-2 rounded-lg text-center">
                      This is only an estimate of what your insurance
                      quote&nbsp;
                      <b>MIGHT</b> be. Actual insurance quotes are made with
                      much more complex algorithms then the one used here.
                    </span>
                  </div>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
