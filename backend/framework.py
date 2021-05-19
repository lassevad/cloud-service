import pandas as pd
import geopandas as gpd
import os.path
import geoplot as gplt
import seaborn as sns
from matplotlib import pyplot as plt


import datapackage
import requests
from shapely.geometry import shape
import geoplot.crs as gcrs

df = pd.read_csv("dataset.csv")
gdf = gpd.read_file("geodataset.csv", GEOM_POSSIBLE_NAMES="geometry", KEEP_GEOM_COLUMNS="NO") 

world_data = gpd.read_file("shapes/world.shp")
world_data = world_data[["NAME", "geometry"]]


class PlotStrategy():
    def plot(self, col1, col2, df, h):
        pass

class MapStrategy():
    def geoPlot(self, gdf, h):
        pass


class Context():
    def __init__(self, strategy: PlotStrategy, df):
        self._strategy = strategy
        self._df = df

    def getStrategy(self):
        return self._strategy

    def setStrategy(self, strategy):
        self._strategy = strategy

    def getDataFrame(self):
        return self._df

    def setDataFrame(self, df):
        self._df = df

    def plot(self, col1, col2, h=None):
        print("Context: Plotting data using the strategy")
        return self._strategy.plot(col1, col2, self.getDataFrame(), h)

    # Manipulate dataset functions

    def filterByRows(self, column, values):
        self.setDataFrame(
            self.getDataFrame().loc[self.getDataFrame()[column].isin(values)])

    def sortByColumn(self, column, a):
        self.setDataFrame(self.getDataFrame().sort_values(
            by=[column], ascending=a))

    def removeCharFromColumn(self, char, column):
        self.getDataFrame()[column] = self.getDataFrame()[
            column].str.replace(char, '')

    def convertToFloat(self, column):
        self.getDataFrame()[column] = self.getDataFrame()[column].astype(float)

    def aggregate(self, group, ag_func):
        newDf = self.getDataFrame().groupby(
            self.getDataFrame()[group]).aggregate(ag_func)
        self.setDataFrame(newDf)

    def headN(self, N):
        self.setDataFrame(self.getDataFrame().head(N))

    def setNoBins(self, x, y):
        pyplot.locator_params(axis='y', nbins=y)
        pyplot.locator_params(axis='x', nbins=x)

    def supervised(self, df, col, fn):
        _fn = fn
        X_train, X_test, Y_train, Y_test = train_test_split(self._df[_fn], df[col], random_state=0)
        model = GaussianNB()
        model.fit(X_train,Y_train)
        Y_pred = model.predict(X_test)
        accuracy_score = metrics.accuracy_score(Y_test, Y_pred)
        print(accuracy_score)
        return accuracy_score

    def unsupervised(self, df, fn):
        _fn = fn
        X_train, X_test, Y_train, Y_test = train_test_split(self._df[_fn], df[col], random_state=0)
        kmeans = KMeans(n_clusters=3)
        kmeans.fit(df)
        plt.scatter(df.values[:,0],df.values[:,1], c=kmeans.labels_, cmap='rainbow')

    def regression(self, df, fn):
        _fn = fn
        X_train, X_test, Y_train, Y_test = train_test_split(self._df[_fn], df[col], random_state=0)
        slRegressor = LinearRegression().fit(X_train, Y_train)
        Y_pred = slRegressor.predict(X_test)
        r_sq = slRegressor.score(X_train, Y_train)
        print('coefficient of determination:', r_sq)
        return r_sq

class MapContext():
    def __init__(self, mapstrategy: MapStrategy, gdf):
        self._mapstrategy = mapstrategy
        self._gdf = gdf

    def getMapStrategy(self):
        return self._mapstrategy

    def setMapStrategy(self, mapstrategy):
        self._mapstrategy = mapstrategy

    def getGeoDataFrame(self):
        return self._gdf

    def setGeoDataFrame(self, gdf):
        self._gdf = gdf

    def geoPlot(self, h=None, cmap=None):
        print("Context: Plotting data using the mapstrategy")
        return self._mapstrategy.geoPlot(self.getGeoDataFrame(), h, cmap)


class ScatterStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.scatterplot(x=col1, y=col2, data=df, hue=h, size=h, sizes=(30, 200))


class ScatterRegStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.regplot(x=col1, y=col2, data=df, fit_reg=True, line_kws={'color': 'red'}).set(xlim=(0, 21))


class LineStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.lineplot(x=col1, y=col2, data=df, hue=h, size=h)


class BarStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.catplot(data=df, kind="bar", x=col1, y=col2, hue=h)


class HistStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.histplot(df, x=col1, y=col2, hue=h, multiple="stack", palette="light:m_r")


class CorrelogramStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.pairplot(df, hue=h)


class BoxStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.boxplot(data=df, x=col1, y=col2, hue=h)


class DensityStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.kdeplot(data=df, x=col1, y=col2, hue=h)


class ViolinStrategy(PlotStrategy):
    def plot(self, col1, col2, df, h):
        return sns.violinplot(data=df, x=col1, y=col2, hue=h)


# Geo Map strategies
class WebmapStrategy(MapStrategy):
    def geoPlot(self, gdf, h, cmap):
        ax = gplt.webmap(world_data, figsize=(15,10), projection=gcrs.WebMercator())
        return gplt.pointplot(gdf, ax=ax, hue=h, cmap=cmap)

class PolymapStrategy(MapStrategy):
    def geoPlot(self, gdf, h, cmap):
        ax = gplt.polyplot(world_data, figsize=(15,10), projection=gcrs.WebMercator())
        return gplt.pointplot(gdf, ax=ax, hue=h, cmap=cmap)

class KdeStrategy(MapStrategy):
    def geoPlot(self, gdf, h, cmap):
        ax = gplt.polyplot(world_data, figsize=(15,10), projection=gcrs.WebMercator())
        return gplt.kdeplot(gdf, ax=ax, hue=h, cmap=cmap)

class ChoroplethStrategy(MapStrategy):
    def geoPlot(self, gdf, h, cmap):
        ax = gplt.polyplot(world_data, figsize=(15,10), projection=gcrs.WebMercator())
        return gplt.choropleth(gdf, ax=ax, hue=h, cmap=cmap, legend=True)


#if __name__ == "__main__":

    #pga.removeCharFromColumn(',', "Money")
    #pga.removeCharFromColumn('$', "Money")
    # pga.convertToFloat("Money")
    #pga.removeCharFromColumn(',', "Points")
    # pga.convertToFloat("Points")

    #con = Context(app.strategy, df)
    #fig = con.plot(app.col1, app.col2, app.hue)
    #fig.savefig("graph.png")