import Skeleton from '../../components/Skeleton/Skeleton';

/** Skeleton shown while TrainingSurface code-split loads */
const TrainingSurfaceSkeleton: React.FC = () => (
  <Skeleton label="Loading training surface">
    <Skeleton.Line />
    <Skeleton.LineShort />
    <Skeleton.Row>
      <Skeleton.Block />
      <Skeleton.Block />
    </Skeleton.Row>
    <Skeleton.Row>
      <Skeleton.Block />
      <Skeleton.Block />
    </Skeleton.Row>
    <Skeleton.Row>
      <Skeleton.Block />
      <Skeleton.Block />
    </Skeleton.Row>
  </Skeleton>
);

export default TrainingSurfaceSkeleton;
