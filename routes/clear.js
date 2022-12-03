const express = require('express');
const app = express();


const { default: Conf } = require('conf');

const store = new Conf();


const router = new express.Router();


store.clear();
