import java.util.Scanner;

public class Round
{
    public static void main(String[] args)
    {
        Scanner input = new Scanner(System.in);
        int t = input.nextInt();
        int count = 0;
        while(t-->0)
        {
            int petya = input.nextInt();
            int vasya = input.nextInt();
            int tonya = input.nextInt();
            if(petya+vasya+tonya >=2)
                ++count;
        }
        System.out.println(count);
    }
}
