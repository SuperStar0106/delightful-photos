import {compose, createStore} from 'redux';
import {reducer} from './reducer';

const initialStore = {
  user: {
    name: 'Ali Balouchi',
    email: 'alibalouchi.74@gmail.com',
    token: '',
  },
  Box: [
    {
      node: {
        group_name: '',
        image: [
          {
            fileSize: null,
            filename: null,
            height: null,
            playableDuration: null,
            uri: '',
            width: null,
          },
        ],
        location: null,
        timestamp: 0,
        type: '',
      },
    },
  ],
};

let store = createStore(reducer as any, initialStore);

export default store;
