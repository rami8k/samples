import express from 'express'
// import jwt from 'express-jwt'
import cors from 'cors'
import { schemas } from './gql-schemas'
import { authContext } from './authContext'
import xlsx from 'xlsx'
import { ApolloServer } from 'apollo-server-express'
import regulations from './repository/regulation'
import { getPriority } from '../src/data/processors'

const app = express()
app.use(cors()) // not having cors enabled will cause an access control error

// const jwtCheck = jwt({ secret: process.env.JWT_SECRET })
// app.use(jwtCheck);

app.get('/api/report/', function (req, res) {
  const regulationsList = regulations.findAll().map(function(x) {
    return [x.id, x.areaId, x.description, x.url, x.controlInPlaceId, x.controlStatusId, x.riskId, getPriority(x.controlInPlaceId, x.controlStatusId, x.riskId).name, x.comments]
  })
  var data = [['Index', 'Area', 'Description', 'Url', 'Control In Place', 'Control Status', 'Risk', 'Priority', 'Comments' ]]
  data = data.concat(regulationsList)

  /* convert from array of arrays to workbook */
  var worksheet = xlsx.utils.aoa_to_sheet(data);
  var workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "SheetJS");

  res.setHeader('Content-Disposition', 'attachment; filename=' + 'compliance_report.xlsx');
  res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']]);

  var wbbuf = xlsx.write(workbook, {
    type: 'base64'
  });
  res.end( Buffer.from(wbbuf, 'base64') );
})

const server = new ApolloServer({
  schema: schemas,
  cors: {
    origin: '*',
    credentials: false,
  },
  context: async ({req}) => { 
    const auth = await authContext(req.headers)
    return {
      auth
    } 
  }
});

server.applyMiddleware({ app }); // app is from an existing express app

app.listen({ port: 5000 }, () =>
  console.log(`🚀 Server ready at http://localhost:5000`)
)
