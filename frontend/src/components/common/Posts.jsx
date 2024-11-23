import { useEffect } from "react";
import Post from "../common/Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType }) => {

	const postEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return '/api/posts/all';
			case "following":
				return '/api/posts/followingPosts';
			default:
				return '/api/posts/all';
		}
	}

	const POST_ENDPOINT = postEndPoint();

	const {data:posts, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ['posts'],
		queryFn: async()=>{
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if(!res.ok){
					throw new Error(data.error || 'Something went wrong')
				}

				return data

			} catch (error) {
				throw new Error(error)
			}
		}
	})

	useEffect(()=>{
		refetch(); 
	},[feedType, refetch])

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;