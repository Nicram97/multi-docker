import { useEffect, useState } from "react";
import axios from 'axios';

const Fib = () => {
    const [state, setState] = useState({
        seenIndexes: [],
        values: {},
        index: '',
    });

    
    useEffect(() => {
        const fetchValues = async () => {
            const values = await axios.get('/api/values/current');
            setState(prev => ({...prev, values: values.data}));
        };
        const fetchIndexes = async () => {
            const seenIndexes = await axios.get('/api/values/all');
            setState(prev => ({...prev, seenIndexes: seenIndexes.data}));
        };

        fetchValues();
        fetchIndexes();
    }, []);

    const renderSeenIndexes = () => {
        return state.seenIndexes.map(({ number }) => number).join(', ');
    }

    const renderValues = () => {
        const entries = [];

        for (let key in state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I calculated {state.values[key]}
                </div>
            )
        }

        return entries;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios.post('/api/values', {
            index: state.index,
        });

        setState(prev => ({...prev, index: ''}))
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index:</label>
                <input 
                    value={state.index}
                    onChange={event => setState(prev => ({...prev, index: event.target.value}))}
                />
                <button>Submit</button>
            </form>

            <h3>Indexes I have seen</h3>
            {renderSeenIndexes()}
            <h3>Calculated values</h3>
            {renderValues()}
        </div>
    );
};

export default Fib;