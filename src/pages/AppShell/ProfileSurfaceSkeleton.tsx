import Skeleton from '../../components/Skeleton/Skeleton';

/** Skeleton shown while ProfileSurface code-split loads */
const ProfileSurfaceSkeleton: React.FC = () => (
  <Skeleton label="Loading profile">
    <Skeleton.Line />
    <Skeleton.Block />
    <Skeleton.LineShort />
    <Skeleton.Line />
    <Skeleton.Line />
    <Skeleton.Line />
    <Skeleton.LineNarrow />
    <Skeleton.Block />
  </Skeleton>
);

export default ProfileSurfaceSkeleton;
