import { GetContext } from '@/utils/language';
import useLang from '@/store/lang';
import { BarChart } from '@mui/x-charts/BarChart';
import { Question } from '..';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  SelectChangeEvent,
} from '@mui/material';

interface VisualizationDataViewProps {
  selectedQuestions: Question[];
  gridRows: { [key: string]: string | { en: string; km: string } }[];
  questionVisualize: Question | undefined;
  handleQuestionVisualizeChange: (event: SelectChangeEvent<string>) => void;
  isChartLoading: boolean;
  handleCloseChart: () => void;
  dataset: any[];
}

const VisualizationDataView: React.FC<VisualizationDataViewProps> = ({
  selectedQuestions,
  gridRows,
  questionVisualize,
  handleQuestionVisualizeChange,
  isChartLoading,
  handleCloseChart,
  dataset,
}) => {
  const lang = useLang(state => state.lang);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'chart.png';
      link.click();
    }
  };

  return (
    <>
      {/* 3 . Visualization Section */}
      {selectedQuestions.length > 0 && gridRows.length > 0 && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
            3. Visualize Data
          </Typography>

          <FormControl sx={{ minWidth: '100%', marginBottom: 2 }}>
            <InputLabel id='project-filter-label'>
              {!questionVisualize ? GetContext('select_question_msg', lang) : GetContext('select_question', lang)}{' '}
            </InputLabel>

            <Select
              variant='standard'
              labelId='project-filter-label'
              id='question-visualize'
              value={JSON.stringify(questionVisualize)}
              onChange={handleQuestionVisualizeChange}>
              {selectedQuestions.map(item => (
                <MenuItem key={item.id} value={JSON.stringify(item)}>
                  {typeof item.label === 'object' ? (lang === 'en' ? item.label.en : item.label.km) : item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Chart Loading */}
      {questionVisualize && isChartLoading && (
        <Box display='flex' justifyContent='center' alignItems='center' sx={{ height: '400px', width: '100%' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Chart Display */}
      {!isChartLoading && questionVisualize && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Box display='flex' justifyContent='flex-end' sx={{ mb: 2 }}>
            <Button onClick={handleDownloadChart} sx={{ marginRight: 1 }} variant='contained' startIcon={<RefreshIcon />}>
              {GetContext('export', lang)}
            </Button>
            <Button
              sx={{ backgroundColor: 'white', color: 'black' }}
              variant='contained'
              onClick={handleCloseChart}
              startIcon={<CloseIcon />}>
              {GetContext('close', lang)}
            </Button>
          </Box>
          <div ref={chartRef}>
            <BarChart
              dataset={dataset}
              xAxis={[{ scaleType: 'band', dataKey: 'value' }]}
              series={[
                {
                  dataKey: 'freq',
                  label:
                    typeof questionVisualize.label === 'object'
                      ? lang === 'en'
                        ? questionVisualize.label.en
                        : questionVisualize.label.km
                      : questionVisualize.label,
                },
              ]}
              height={400}
              yAxis={[{ label: GetContext('responses', lang) }]}
            />
          </div>
        </Paper>
      )}
    </>
  );
};

export default VisualizationDataView;
