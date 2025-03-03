import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Load Stripe outside of the component to avoid recreating it on re-renders
const stripePromise = loadStripe('pk_test_51Qydy14fWM471SM6QekN5hz7Q15wbEWaTFcBtU66YWEO7LHWZ7GJPcP0LUpx7dyd08C5aUTkji8zHfoc5a8nv5hV00mqOSzpfr');

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  amount: number;
  productName: string;
}

// Stripe payment form component
const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  onSuccess,
  onError,
  onCancel,
  amount,
  productName
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'HabitJoy Customer',
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message || 'An error occurred with your payment');
        onError(paymentError.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      } else {
        setError('Something went wrong with your payment. Please try again.');
        onError('Payment did not complete');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="p-3 border border-gray-300 rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          You will be charged ${amount.toFixed(2)} for {productName}
        </div>
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || processing}
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

// Wrapper component that provides the Stripe context
export const StripePaymentWrapper: React.FC<{
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
  amount: number;
  productName: string;
}> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentWrapper;