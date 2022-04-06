const MongoWraper= require("mongoclienteasywrapper")("mongodb://knesys:knesysiot123@localhost:27030")






const test=async()=>{
   const status=await MongoWraper.SavetoMongo({prueba:true},"new","tracsadb")
    console.log(status)
}
test()