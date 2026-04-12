#leetcoddeeee 1480 easy rated problem
class Solution:
    def runningSum(self, nums: List[int]) -> List[int]:
        answer = []
        for i in range(len(nums)):
            running_sum = 0
            for j in range(i + 1):
                running_sum += nums[j]
            answer.append(running_sum)
        return answer