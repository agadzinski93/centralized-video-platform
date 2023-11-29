//Column labels for User table in database
const USER_COLS = {
    USER_ID:'user_id',
    USERNAME:'username',
    DISPLAY_NAME:'display_name',
    EMAIL:'email',
    PASSWORD:'password',
    DATE_JOINED:'dateJoined',
    ACCOUNT_TYPE:'account_type',
    ACTIVATION_STATUS:'activation_status',
    SETTING_REFRESH_TITLE:'settingRefreshTitle',
    SETTING_REFRESH_DESCRIPTION:'settingRefreshDescription',
    SETTING_REFRESH_THUMBNAIL:'settingRefreshThumbnail',
    PIC_URL:'pic_url',
    PIC_FILENAME:'pic_filename',
    ABOUT_ME:'about_me',
    BANNER_URL:'banner_url',
    BANNER_FILENAME:'banner_filename',
    SUBSCRIBERS:'subscribers',
    SUBSCRIPTIONS:'subscriptions',
    /**
     * 
     * @param {string[]} cols - array of strings representing columns in a SQL database
     * @returns {string} concatenation of columns for use in a SQL SELECT statement
     */
    concat_user_columns:function(cols){
        let output = '';
        if (cols) {
            output += cols[0];
            let length = cols.length;
            if (length > 1) {
                let i = 1;
                do {
                    output += `,${cols[i]}`;
                    i++;
                }while(i<length);
            }
        }
        return output;
    }
}
export {USER_COLS};