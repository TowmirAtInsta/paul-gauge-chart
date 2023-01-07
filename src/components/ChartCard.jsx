import { Box, Card, CardContent, Typography } from '@mui/material'
import React from 'react'

import GaugeChart from 'react-gauge-chart'

const chartStyle = {
    height: 100
}

const ChartCard = ({ labelOfChart, data, colors, limit, nrOfLevels }) => {
    let amount = data.reduce((prevValue, currentData) => prevValue + currentData.Amount, 0)
    console.log(data)

  return (
    <Card sx={{ width: "100%", mb: "1rem" }}>
      <CardContent>
        <Typography sx={{
            fontWeight: "bold",
            fontSize: "1.2rem",
            mt: "1rem",
            mb: "0.7rem"
        }}>{labelOfChart}</Typography>

        <Box
            sx={{
                mb: "1rem",
                height: "16rem"
            }}
        >
            <GaugeChart 
                id={labelOfChart} 
                style={chartStyle} 
                nrOfLevels={nrOfLevels}
                colors={colors}
                percent={(amount / limit) > 1 ? 1: (amount / limit)} 
                arcsLength={[0.3, 0.5]}
            />
        </Box>

        <Typography>
            Target: <strong>{limit}</strong>
        </Typography>

        <Typography>
            Total Deal Amount: <strong>{Math.round(amount)}</strong>
        </Typography>

        <Typography>
            Target Filled Up: <strong>{((Math.round(amount) / limit) * 100).toFixed(2)}</strong>%
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ChartCard