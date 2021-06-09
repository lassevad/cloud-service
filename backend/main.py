from pyspark import SparkContext, SparkConf
from pyspark.streaming import StreamingContext

conf = SparkConf()
conf.setAppName("BitcoinStreamApp")

sc = SparkContext(conf=conf)
sc.setLogLevel("ERROR")

ssc = StreamingContext(sc, 1)

ssc.checkpoint("checkpoint_BitcoinApp")

dataStream = ssc.socketTextStream("localhost", 9009)

dataStream.pprint()

ssc.start()
ssc.awaitTermination()
