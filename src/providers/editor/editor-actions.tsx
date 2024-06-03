import { DeviceTypes, EditorElement } from './editor-provider'

//everytime we want to change the state, we have to dispatch one of below these actions.
//e.g., we can dispatch add event or update element or any one action here, and then we need to provide all the 
//values inside. 
export type EditorAction =
    | {
        type: 'ADD_ELEMENT'
        payload: {
            containerId: string
            elementDetails: EditorElement
        }
    }
    | {
        type: 'UPDATE_ELEMENT'
        payload: {
            elementDetails: EditorElement
        }
    }
    | {
        type: 'DELETE_ELEMENT'
        payload: {
            elementDetails: EditorElement
        }
    }
    | {
        type: 'CHANGE_CLICKED_ELEMENT'
        payload: {
            elementDetails?:
            | EditorElement
            | {
                id: ''
                content: []
                name: ''
                styles: {}
                type: null
            }
        }
    }
    | {
        type: 'CHANGE_DEVICE'
        payload: {
            device: DeviceTypes
        }
    }
    | {
        type: 'TOGGLE_PREVIEW_MODE'
    }
    | {
        type: 'TOGGLE_LIVE_MODE'
        payload?: {
            value: boolean
        }
    }
    | { type: 'REDO' }
    | { type: 'UNDO' }
    | {
        type: 'LOAD_DATA'
        payload: {
            elements: EditorElement[]
            withLive: boolean
        }
    }
    | {
        type: 'SET_FUNNELPAGE_ID'
        payload: {
            funnelPageId: string
        }
    }