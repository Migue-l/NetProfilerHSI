import { useState } from 'react'

// This hook exists so that we don't have to change each
// component's code if we change how we handle server responses

// Define reusable hook for managing server responses
const useServerResponse = (stateText) => {
    const [response, setResponse] = useState(stateText);
    return [response, setResponse];
};

export default useServerResponse