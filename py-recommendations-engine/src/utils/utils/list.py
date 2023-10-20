# converts array to array of arrays of size n
def chunks(original_list, n):
    n = max(1, n)
    return [original_list[i:i+n] for i in range(0, len(original_list), n)]