import { expect, test } from "@jest/globals";
import { createEmail } from "../server/utilities/email/Email.ts";
import { EMAIL_USER } from "../server/utilities/config/config.ts";
import { ApiResponse } from "../server/utilities/ApiResponse.ts";
import { paramsExist } from "../server/utilities/validators/paramsExist.ts";
import { setPaginationData, endOfResults } from "../server/utilities/helpers/pagination.ts";
import { USER_COLS } from "../server/utilities/globals/user.ts";

test('Generate Email Object',()=>{
    expect(createEmail('sample@example.com','Subject','Text Message','<p>HTML Email</p>'))
        .toEqual({
            from: EMAIL_USER,
            bcc:'sample@example.com',
            subject:'Subject',
            text:'Text Message',
            html:'<p>HTML Email</p>'
        });
});

test('API Test: Params Exist',()=>{
    expect(paramsExist(['first',1,true])).toBe(true);
    expect(paramsExist(['second',undefined,true])).toBe(false);
});

test('API Test: Response Class',()=>{
    const Response = new ApiResponse('error',500,'Something went wrong');
    expect(Response.getApiResponse()).toEqual({
        response:'error',
        status:500,
        message:'Something went wrong',
        prevPath:'/',
        data: {}
    });
    Response.setResponse = 'success';
    Response.setStatus = 200;
    Response.setMessage = 'Successfully sent data.';
    Response.setPrevPath = '/auth/login';
    expect(Response.getApiResponse()).toEqual({
        response:'success',
        status:200,
        message:'Successfully sent data.',
        prevPath:'/auth/login',
        data: {}
    });
    Response.setApiResponse('error',422,'Invalid arguments');
    expect(Response.getApiResponse()).toEqual({
        response:'error',
        status:422,
        message:'Invalid arguments',
        prevPath:'/',
        data: {}
    });
});

test('Pagination Tests',()=>{
    expect(setPaginationData(10,0)).toEqual({
        resultsPerPage:10,
        pageNum:0
    });
    expect(setPaginationData(5,1)).toEqual({
        resultsPerPage:5,
        pageNum:0
    });
    expect(setPaginationData(25,5)).toEqual({
        resultsPerPage:25,
        pageNum:4
    });
    expect(setPaginationData(10,-3)).toEqual({
        resultsPerPage:10,
        pageNum:0
    });
    expect(endOfResults(25,3,75)).toBe(false);
    expect(endOfResults(10,4,63)).toBe(true);
    expect(endOfResults(25,3,74)).toBe(false);
    expect(endOfResults(5,6,31)).toBe(true);
});

test('Choose User Columns When Querying User in DB',()=>{
    const {
        USER_ID,
        USERNAME,
        EMAIL,
        PIC_FILENAME,
        ACTIVATION_STATUS,
        concat_user_columns
    } = USER_COLS;
    expect(concat_user_columns(undefined)).toBe('');
    expect(concat_user_columns([USER_ID])).toBe(USER_ID);
    expect(concat_user_columns([USER_ID,USERNAME,EMAIL]))
        .toBe(`${USER_ID},${USERNAME},${EMAIL}`);
});