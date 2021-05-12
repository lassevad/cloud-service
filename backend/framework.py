import pandas as pd
import os.path

import seaborn as sns
from matplotlib import pyplot as plt


df = pd.read_csv("dataset.csv")


class PlotStrategy():
    def plot(self, col1, col2, df, h):
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


if __name__ == "__main__":

    #pga.removeCharFromColumn(',', "Money")
    #pga.removeCharFromColumn('$', "Money")
    # pga.convertToFloat("Money")
    #pga.removeCharFromColumn(',', "Points")
    # pga.convertToFloat("Points")

    con = Context(app.strategy, df)
    fig = con.plot(app.col1, app.col2, app.hue)
    fig.savefig("graph.png")

