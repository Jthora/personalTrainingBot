import Skeleton from '../../components/Skeleton/Skeleton';

/** Skeleton shown while ReviewDashboard code-split loads */
const ReviewDashboardSkeleton: React.FC = () => (
  <Skeleton label="Loading review dashboard">
    <Skeleton.Line />
    <Skeleton.LineShort />
    <Skeleton.Row>
      <Skeleton.Chip />
      <Skeleton.Chip />
    </Skeleton.Row>
    <Skeleton.Block />
    <Skeleton.Line />
    <Skeleton.Block />
    <Skeleton.Block />
  </Skeleton>
);

export default ReviewDashboardSkeleton;
