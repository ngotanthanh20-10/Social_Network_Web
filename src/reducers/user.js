
import { END_UPDATING, FOLLOW, SET_USER, START_UPDATING, UNFOLLOW, UPDATE_USER } from '../constants/actionTypes';

const initState = {
    isUpdating: false,
    userData: JSON.parse(localStorage.getItem('profile'))
};


const authReducer = (state = initState,action) => {
    switch (action.type) {
        case START_UPDATING:
            return { ...state, isUpdating: true };
    
        case END_UPDATING:
            return { ...state, isUpdating: false };
            
        case UPDATE_USER:
            localStorage.setItem('profile', JSON.stringify({ ...action?.data }));
            return { ...state, userData: action?.data }

        case SET_USER:
            return { ...state, userData: action?.data }

        case FOLLOW:
            console.log("follow user");
            return {
                ...state,
                userData: {...state.userData, result: 
                    {...state.userData.result, followings: 
                        [...state.userData.result.followings, action.payload ]
                    } 
                } 
            }

        case UNFOLLOW:
            return {
                ...state,
                userData: {...state.userData, result:
                    {...state.userData.result, followings:
                        state.userData.result.followings.filter((id) => id !== action.payload)
                    }
                }
            }
        
        
        default:
            return state;
    }
};

export default authReducer;