import { useState } from "react";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import StyledCardElement from "./components/ui/StyledCardElement";
import CardInfo from "./components/ui/InfoBox";

const stripePromise = loadStripe(
  "pk_test_51Qhy6WRx1C5CFKRjYGWyVAnaYmZR08MczdtEAwh2qKZzLTysZFd72IWnRx19spv4UKwq4kvxeSVHpEuizHhhaKmv00y6gSjtub"
);
const apiUrl = import.meta.env.VITE_API_URL;

const PaymentForm = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [showFakeData, setShowFakeData] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentId, setPaymentId] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");

  const handleMicropayment = async () => {
    if (!stripe || !elements) return;

    try {
      const response = await fetch(`${apiUrl}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          amount: parseInt(amount) * 100, // Convertir a céntimos
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error("Failed to retrieve client secret");
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: email,
            },
          },
        }
      );

      if (error) {
        console.error(error);
        alert("Payment failed!");
      } else {
        console.log("Payment successful:", paymentIntent);

        // Actualizar el estado con el PaymentIntent ID
        setPaymentIntentId(paymentIntent.id);

        alert("Micropayment successful!");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing payment.");
    }
  };

  const handleRefund = async () => {
    if (!paymentId) {
      alert("PaymentIntent ID is required for a refund.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId: paymentId }),
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        alert("Refund failed: " + data.error);
      } else if (data.message) {
        console.log(data.message);
        alert(data.message);
      } else {
        console.log("Refund successful:", data.refund);
        alert("Refund successful!");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing refund.");
    }
  };

  const handleToggleFakeData = () => {
    setShowFakeData(!showFakeData);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Stripe Payment Integration</h1>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full max-w-md"
      />
      <Input
        id="amount"
        type="number"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="mb-4 w-full max-w-md"
      />
      <div className="w-full max-w-md">
        <StyledCardElement id="cardNumber" className="p-2 border rounded-md" />
      </div>
      <div className="flex space-x-4 mt-4">
        <Button
          onClick={handleMicropayment}
          variant="primary"
          disabled={!stripe || !elements}
        >
          Micropayment
        </Button>
      </div>
      <div>
        <Input
          id="amount"
          type="text"
          placeholder="Payment Intent ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          className="mb-4 w-full max-w-md"
        />
        <Button onClick={handleRefund} variant="destructive">
          Refund
        </Button>
      </div>
      <Button onClick={handleToggleFakeData} variant="outline">
        {showFakeData ? "Hide Fake Data" : "Show Fake Data"}
      </Button>

      {showFakeData && <CardInfo paymentIntentId={paymentIntentId} />}
    </div>
  );
};

const App = () => {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <PaymentForm />
      </div>
    </Elements>
  );
};

export default App;
