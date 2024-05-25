import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import type { FlashMessageInfo, FlashMessageType } from "../../types/types";

interface initialFlashMessageState {
    lastId: number,
    messages: FlashMessageType[]
}

const initialState: initialFlashMessageState = {
    lastId: 0,
    messages: []
};

const flashMessageSlice = createSlice({
    name: 'flashMessages',
    initialState,
    reducers: {
        addMessage: (state, action: PayloadAction<FlashMessageInfo>) => {
            const id = ++state.lastId;
            state.lastId = id;
            state.messages.push({ id, ...action.payload });
        },
        removeMessage: (state, action: PayloadAction<{ id: number }>) => {
            let i = 0;
            let done = false;
            while (!done && i < state.messages.length) {
                if (state.messages[i].id === action.payload.id) {
                    state.messages.splice(i, 1);
                    done = true;
                }
                i++;
            }
        }
    }
});

export const { addMessage, removeMessage } = flashMessageSlice.actions;
export default flashMessageSlice.reducer;