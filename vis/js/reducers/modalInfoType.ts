const modalInfoType = (state = {}, action: any) => {
    if (action.canceled) {
        return state;
    }

    switch (action.type) {
        // does not change after the first setup
        default:
            return state;
    }
};

export default modalInfoType;
